const { readData, writeData } = require('./db');

/**
 * Create a notification for a user
 * @param {number} userId - The user to notify
 * @param {string} type - Notification type (e.g., 'bid_placed', 'bid_accepted', etc.)
 * @param {string} message - The notification message
 * @param {object} metadata - Optional metadata (productId, bidId, etc.)
 */
async function createNotification(userId, type, message, metadata = {}) {
    try {
        const db = await readData();
        const notifications = db.notifications || [];

        const newNotification = {
            id: notifications.length > 0 ? Math.max(...notifications.map(n => n.id)) + 1 : 1,
            user_id: userId,
            type,
            message,
            is_read: false,
            created_at: new Date().toISOString(),
            ...metadata
        };

        notifications.push(newNotification);
        db.notifications = notifications;
        await writeData(db);

        console.log(`[NOTIFICATION] ${type} for user ${userId}: ${message}`);
        return newNotification;
    } catch (error) {
        console.error('Error creating notification:', error);
    }
}

/**
 * Create notification when a new bid is placed
 * Notifies: The seller
 */
async function notifyNewBid(productId, buyerId, quantity, pricePerKg, totalPrice) {
    try {
        const db = await readData();
        const products = db.products || [];
        const users = db.users || [];

        const product = products.find(p => p.id === productId);
        const buyer = users.find(u => u.id === buyerId);

        if (!product || !buyer) return;

        const message = `New bid on "${product.title}" from ${buyer.company_name}: ${quantity}kg @ ${pricePerKg} DZ/kg`;

        await createNotification(product.seller_id, 'new_bid', message, {
            product_id: productId,
            buyer_id: buyerId,
            quantity,
            price_per_kg: pricePerKg,
            total_price: totalPrice
        });
    } catch (error) {
        console.error('Error notifying new bid:', error);
    }
}

/**
 * Create notification when a bid is accepted/allocated
 * Notifies: The buyer
 */
async function notifyBidAccepted(allocationId, productId, buyerId, quantity, finalPrice) {
    try {
        const db = await readData();
        const products = db.products || [];

        const product = products.find(p => p.id === productId);
        if (!product) return;

        const message = `Your bid on "${product.title}" has been accepted! ${quantity}kg @ ${finalPrice} DZ total`;

        await createNotification(buyerId, 'bid_accepted', message, {
            product_id: productId,
            allocation_id: allocationId,
            quantity,
            final_price: finalPrice
        });
    } catch (error) {
        console.error('Error notifying bid accepted:', error);
    }
}

/**
 * Create notification when a product auction closes
 * Notifies: All bidders on that product (except winners)
 */
async function notifyAuctionClosed(productId) {
    try {
        const db = await readData();
        const products = db.products || [];
        const bids = db.bids || [];
        const allocations = db.allocations || [];

        const product = products.find(p => p.id === productId);
        if (!product) return;

        // Get all unique bidders on this product
        const bidderIds = [...new Set(bids.filter(b => b.product_id === productId).map(b => b.buyer_id))];
        
        // Get winner IDs from allocations
        const winnerIds = allocations.filter(a => a.product_id === productId).map(a => a.buyer_id);

        // Notify non-winners
        for (const bidderId of bidderIds) {
            if (!winnerIds.includes(bidderId)) {
                const message = `Auction for "${product.title}" has ended`;
                await createNotification(bidderId, 'auction_closed', message, {
                    product_id: productId
                });
            }
        }
    } catch (error) {
        console.error('Error notifying auction closed:', error);
    }
}

/**
 * Create notification when product is marked as sold/expired
 * Notifies: The seller
 */
async function notifyProductStatusChange(productId, newStatus) {
    try {
        const db = await readData();
        const products = db.products || [];

        const product = products.find(p => p.id === productId);
        if (!product) return;

        let message = '';
        if (newStatus === 'sold') {
            message = `Your product "${product.title}" has been sold!`;
        } else if (newStatus === 'expired') {
            message = `Your product "${product.title}" has expired without sales`;
        } else if (newStatus === 'closed') {
            message = `Your product "${product.title}" auction has ended`;
        }

        if (message) {
            await createNotification(product.seller_id, `product_${newStatus}`, message, {
                product_id: productId,
                status: newStatus
            });
        }
    } catch (error) {
        console.error('Error notifying product status change:', error);
    }
}

/**
 * Create notification when a product is deleted
 * Notifies: All bidders on that product
 */
async function notifyProductDeleted(productId, productTitle) {
    try {
        const db = await readData();
        const bids = db.bids || [];

        // Get all unique bidders on this product
        const bidderIds = [...new Set(bids.filter(b => b.product_id === productId).map(b => b.buyer_id))];

        // Notify all bidders
        for (const bidderId of bidderIds) {
            const message = `Product "${productTitle}" has been deleted. Your bids have been canceled.`;
            await createNotification(bidderId, 'product_deleted', message, {
                product_id: productId
            });
        }
    } catch (error) {
        console.error('Error notifying product deleted:', error);
    }
}

/**
 * Create notification when a new product is listed matching buyer preferences
 * Notifies: Buyers who have that category as preference
 */
async function notifyNewProductMatch(productId) {
    try {
        const db = await readData();
        const products = db.products || [];
        const buyers = db.users || [];
        const preferences = db.buyer_preferences || [];

        const product = products.find(p => p.id === productId);
        if (!product) return;

        // Find buyers who prefer this category
        const preferringBuyers = preferences.filter(p => p.category_id === product.category_id);

        for (const pref of preferringBuyers) {
            const buyer = buyers.find(b => b.id === pref.buyer_id && b.role === 'buyer');
            if (buyer) {
                const message = `New product "${product.title}" matches your preferences!`;
                await createNotification(pref.buyer_id, 'new_product_match', message, {
                    product_id: productId,
                    category_id: product.category_id
                });
            }
        }
    } catch (error) {
        console.error('Error notifying new product match:', error);
    }
}

/**
 * Create notification when a seller receives a new message or inquiry
 * Can be extended later for messaging system
 */
async function notifySellerInquiry(sellerId, buyerName, productTitle) {
    try {
        const message = `${buyerName} inquired about "${productTitle}"`;
        await createNotification(sellerId, 'seller_inquiry', message, {
            inquiry_type: 'product_question'
        });
    } catch (error) {
        console.error('Error notifying seller inquiry:', error);
    }
}

/**
 * Get all unread notifications for a user
 */
async function getUnreadNotifications(userId) {
    try {
        const db = await readData();
        const notifications = db.notifications || [];
        return notifications.filter(n => n.user_id === userId && !n.is_read);
    } catch (error) {
        console.error('Error getting unread notifications:', error);
        return [];
    }
}

/**
 * Get all notifications for a user (with pagination)
 */
async function getUserNotifications(userId, limit = 50, offset = 0) {
    try {
        const db = await readData();
        const notifications = db.notifications || [];
        const userNotifications = notifications.filter(n => n.user_id === userId);
        
        // Sort by created_at descending (newest first)
        userNotifications.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        return {
            total: userNotifications.length,
            unread: userNotifications.filter(n => !n.is_read).length,
            notifications: userNotifications.slice(offset, offset + limit)
        };
    } catch (error) {
        console.error('Error getting user notifications:', error);
        return { total: 0, unread: 0, notifications: [] };
    }
}

/**
 * Mark a notification as read
 */
async function markAsRead(notificationId) {
    try {
        const db = await readData();
        const notification = db.notifications?.find(n => n.id === notificationId);
        
        if (notification) {
            notification.is_read = true;
            await writeData(db);
            return notification;
        }
    } catch (error) {
        console.error('Error marking notification as read:', error);
    }
}

/**
 * Mark all notifications for a user as read
 */
async function markAllAsRead(userId) {
    try {
        const db = await readData();
        const notifications = db.notifications || [];
        
        notifications.forEach(n => {
            if (n.user_id === userId && !n.is_read) {
                n.is_read = true;
            }
        });
        
        await writeData(db);
        return true;
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
    }
}

/**
 * Delete a notification
 */
async function deleteNotification(notificationId) {
    try {
        const db = await readData();
        const index = db.notifications?.findIndex(n => n.id === notificationId);
        
        if (index > -1) {
            db.notifications.splice(index, 1);
            await writeData(db);
            return true;
        }
    } catch (error) {
        console.error('Error deleting notification:', error);
    }
}

/**
 * Delete all notifications for a user
 */
async function deleteAllNotifications(userId) {
    try {
        const db = await readData();
        db.notifications = (db.notifications || []).filter(n => n.user_id !== userId);
        await writeData(db);
        return true;
    } catch (error) {
        console.error('Error deleting all notifications:', error);
    }
}

module.exports = {
    createNotification,
    notifyNewBid,
    notifyBidAccepted,
    notifyAuctionClosed,
    notifyProductStatusChange,
    notifyProductDeleted,
    notifyNewProductMatch,
    notifySellerInquiry,
    getUnreadNotifications,
    getUserNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications
};
