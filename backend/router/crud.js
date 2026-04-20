const express = require('express');
const fs = require('fs');
const path = require('path');
const { readData, writeData } = require('../utils/db');
const {
    notifyNewBid,
    notifyBidAccepted,
    notifyAuctionClosed,
    notifyProductStatusChange,
    notifyProductDeleted,
    notifyNewProductMatch
} = require('../utils/notifications');

const router = express.Router();

/**
 * Middleware to check if the requested entity (table/collection) exists in the database.
 */
async function checkEntityExists(req, res, next) {
    const { entity } = req.params;
    try {
        const db = await readData();
        if (!db[entity]) {
            // Optional: Auto-create the entity array if it doesn't exist
            // db[entity] = [];
            // await writeData(db);
            // return next();
            return res.status(404).json({ error: `Entity '${entity}' not found.` });
        }
        req.db = db;
        req.entityData = db[entity];
        next();
    } catch (error) {
        res.status(500).json({ error: "Database error" });
    }
}

// GET /api/:entity -> Read all records
router.get('/:entity', checkEntityExists, async (req, res) => {
    res.json(req.entityData);
});

// GET /api/:entity/:id -> Read a specific record
router.get('/:entity/:id', checkEntityExists, async (req, res) => {
    const { id } = req.params;
    // We try parsing ID as number first, then fallback to string if needed
    const record = req.entityData.find(item => item.id == id);
    
    if (!record) {
        return res.status(404).json({ error: `Record with id ${id} not found.` });
    }
    
    res.json(record);
});

// POST /api/:entity -> Create a new record
router.post('/:entity', checkEntityExists, async (req, res) => {
    try {
        const newRecord = { ...req.body };
        
        // Auto-generate numeric ID if not provided
        if (!newRecord.id) {
            const maxId = req.entityData.reduce((max, item) => {
                const numId = parseInt(item.id, 10);
                return !isNaN(numId) && numId > max ? numId : max;
            }, 0);
            newRecord.id = maxId + 1;
        }

        // Generate creation date automatically if applicable
        if(!newRecord.created_at) {
            newRecord.created_at = new Date().toISOString();
        }

        req.entityData.push(newRecord);
        await writeData(req.db);
        
        // Trigger notifications for different entity types
        if (req.params.entity === 'bids' && newRecord.product_id) {
            // Notify seller of new bid
            try {
                await notifyNewBid(
                    newRecord.product_id,
                    newRecord.buyer_id,
                    newRecord.quantity_requested,
                    newRecord.price_per_kg,
                    newRecord.total_price
                );
            } catch (err) {
                console.error('Failed to notify new bid:', err);
            }

            // Broadcast updated ordered bids to WebSocket subscribers
            try {
                const { broadcastBidsUpdate } = require('./socket');
                broadcastBidsUpdate(Number(newRecord.product_id));
            } catch (err) { /* silent fail if socket not started */ }
        }
        
        if (req.params.entity === 'products' && newRecord.id) {
            // Notify buyers matching this product category
            try {
                await notifyNewProductMatch(newRecord.id);
            } catch (err) {
                console.error('Failed to notify product match:', err);
            }
        }

        res.status(201).json(newRecord);
    } catch (error) {
        res.status(500).json({ error: "Failed to create record" });
    }
});


// PUT /api/:entity/:id -> Update a record partially (as requested)
router.put('/:entity/:id', checkEntityExists, async (req, res) => {
    try {
        const { id, entity } = req.params;
        const index = req.entityData.findIndex(item => item.id == id);

        if (index === -1) {
            return res.status(404).json({ error: `Record with id ${id} not found.` });
        }

        const oldRecord = req.entityData[index];
        const oldStatus = oldRecord.status;

        // Merges existing object with body instead of replacing entirely
        req.entityData[index] = { ...req.entityData[index], ...req.body, id: req.entityData[index].id };
        const newRecord = req.entityData[index];
        const newStatus = newRecord.status;

        await writeData(req.db);

        // Notify for product status changes
        if (entity === 'products' && oldStatus && newStatus && oldStatus !== newStatus) {
            try {
                await notifyProductStatusChange(Number(id), newStatus);
            } catch (err) {
                console.error('Failed to notify product status change:', err);
            }

            // If auction closed, notify bidders
            if ((newStatus === 'closed' || newStatus === 'sold') && oldStatus === 'active') {
                try {
                    await notifyAuctionClosed(Number(id));
                } catch (err) {
                    console.error('Failed to notify auction closed:', err);
                }
            }
        }

        // Notify subscribers if this is a product update
        if (entity === 'products') {
            try {
                const { broadcastBidsUpdate } = require('./socket');
                broadcastBidsUpdate(Number(id));
            } catch (err) {}
        }

        // Notify buyer if their bid was accepted (allocation created)
        if (entity === 'allocations') {
            try {
                await notifyBidAccepted(
                    newRecord.id,
                    newRecord.product_id,
                    newRecord.buyer_id,
                    newRecord.allocated_quantity,
                    newRecord.final_price
                );
            } catch (err) {
                console.error('Failed to notify bid accepted:', err);
            }
        }

        res.json(req.entityData[index]);
    } catch (error) {
        res.status(500).json({ error: "Failed to update record" });
    }
});

// PATCH /api/:entity/:id -> Update partially a record
router.patch('/:entity/:id', checkEntityExists, async (req, res) => {
    try {
        const { id, entity } = req.params;
        const index = req.entityData.findIndex(item => item.id == id);

        if (index === -1) {
            return res.status(404).json({ error: `Record with id ${id} not found.` });
        }

        const oldRecord = req.entityData[index];
        const oldStatus = oldRecord.status;

        // Merges existing object with body
        req.entityData[index] = { ...req.entityData[index], ...req.body, id: req.entityData[index].id };
        const newRecord = req.entityData[index];
        const newStatus = newRecord.status;

        await writeData(req.db);

        // Notify for product status changes
        if (entity === 'products' && oldStatus && newStatus && oldStatus !== newStatus) {
            try {
                await notifyProductStatusChange(Number(id), newStatus);
            } catch (err) {
                console.error('Failed to notify product status change:', err);
            }

            // If auction closed, notify bidders
            if ((newStatus === 'closed' || newStatus === 'sold') && oldStatus === 'active') {
                try {
                    await notifyAuctionClosed(Number(id));
                } catch (err) {
                    console.error('Failed to notify auction closed:', err);
                }
            }
        }

        // Notify subscribers if this is a product update
        if (entity === 'products') {
            try {
                const { broadcastBidsUpdate } = require('./socket');
                broadcastBidsUpdate(Number(id));
            } catch (err) {}
        }

        // Notify buyer if their bid was accepted (allocation created)
        if (entity === 'allocations') {
            try {
                await notifyBidAccepted(
                    newRecord.id,
                    newRecord.product_id,
                    newRecord.buyer_id,
                    newRecord.allocated_quantity,
                    newRecord.final_price
                );
            } catch (err) {
                console.error('Failed to notify bid accepted:', err);
            }
        }

        res.json(req.entityData[index]);
    } catch (error) {
        res.status(500).json({ error: "Failed to update record partially" });
    }
});

// DELETE /api/:entity/:id -> Delete a record
router.delete('/:entity/:id', checkEntityExists, async (req, res) => {
    try {
        const { id, entity } = req.params;
        const index = req.entityData.findIndex(item => item.id == id);

        if (index === -1) {
            return res.status(404).json({ error: `Record with id ${id} not found.` });
        }

        const deletedRecord = req.entityData.splice(index, 1)[0];

        // If deleting a product, also delete related images, bids, and allocations
        if (entity === 'products') {
            const productId = Number(id);
            
            // Delete all image files from uploads folder
            if (req.db.product_images) {
                const productImages = req.db.product_images.filter(img => img.product_id === productId);
                productImages.forEach(img => {
                    try {
                        // Extract filename from URL (e.g., "1776694110948-t5oppqvgn.jpg")
                        const filename = img.image_url.split('/').pop();
                        const filePath = path.join(__dirname, '../public/uploads', filename);
                        if (fs.existsSync(filePath)) {
                            fs.unlinkSync(filePath);
                            console.log(`Deleted image file: ${filename}`);
                        }
                    } catch (err) {
                        console.error(`Failed to delete image file: ${err.message}`);
                    }
                });
            }
            
            // Delete all images from database
            if (req.db.product_images) {
                req.db.product_images = req.db.product_images.filter(img => img.product_id !== productId);
            }
            
            // Delete all bids for this product
            if (req.db.bids) {
                req.db.bids = req.db.bids.filter(bid => bid.product_id !== productId);
            }
            
            // Delete all allocations for this product
            if (req.db.allocations) {
                req.db.allocations = req.db.allocations.filter(alloc => alloc.product_id !== productId);
            }
        }

        await writeData(req.db);

        // Notify subscribers and bidders if this was a product delete
        if (entity === 'products') {
            try {
                // Notify all bidders that the product was deleted
                await notifyProductDeleted(Number(id), deletedRecord.title);
            } catch (err) {
                console.error('Failed to notify product deleted:', err);
            }

            try {
                const { broadcastBidsUpdate } = require('./socket');
                broadcastBidsUpdate(Number(id));
            } catch (err) {}
        }

        res.json({ message: "Record deleted", deleted: deletedRecord });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete record" });
    }
});

module.exports = router;
