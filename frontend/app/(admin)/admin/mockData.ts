export const mockData = {
    "users": [
        {
            "id": 1,
            "company_name": "Farm Fresh",
            "email": "seller@mail.com",
            "password_hash": "hashed_pwd",
            "phone": "077777777777777",
            "role": "seller",
            "is_verified": false,
            "first_name": "lokman",
            "last_name": "Doe",
            "avatar": "https://example.com/avatar.jpg",
            "is_active": true,
            "created_at": "2026-04-01"
        }
    ],
    "company_verification": [
        {
            "id": 1,
            "user_id": 1,
            "business_id": "RC123456",
            "business_license": [
                "https://example.com/license.jpg",
                "https://example.com/license2.jpg"
            ],
            "status": "approved",
            "verified_by": "admin",
            "created_at": "2026-04-01"
        }
    ],
    "product_categories": [
        {
            "id": 1,
            "name": "Vegetables"
        }
    ],
    "products": [
        {
            "id": 1,
            "seller_id": 1,
            "category_id": 1,
            "title": "Potatoes",
            "description": "Fresh potatoes",
            "quality": "A",
            "quantity_available": 600,
            "price_full_sale": 12000,
            "starting_price": 50,
            "location_id": 1,
            "status": "active",
            "start_time": "2026-04-01T10:00:00",
            "end_time": "2026-04-02T10:00:00",
            "created_at": "2026-04-01"
        }
    ],
    "product_images": [
        {
            "id": 1,
            "product_id": 1,
            "image_url": "https://example.com/image.jpg"
        }
    ],
    "bids": [
        {
            "id": 1,
            "product_id": 1,
            "buyer_id": 1,
            "quantity_requested": 200,
            "price_per_kg": 55,
            "total_price": 11000,
            "status": "pending",
            "created_at": "2026-04-01T12:00:00"
        }
    ],
    "allocations": [
        {
            "id": 1,
            "product_id": 1,
            "buyer_id": 1,
            "bid_id": 1,
            "allocated_quantity": 200,
            "final_price": 11000,
            "created_at": "2026-04-02"
        }
    ],
    "buyer_preferences": [
        {
            "id": 1,
            "buyer_id": 1,
            "category_id": 1
        }
    ],
    "notifications": [
        {
            "id": 1,
            "user_id": 1,
            "type": "new_product",
            "message": "New product available: Potatoes",
            "is_read": false,
            "created_at": "2026-04-01"
        }
    ],
    "locations": [
        {
            "id": 1,
            "user_id": 1,
            "id_wilaya": 25,
            "id_commune": 14,
            "address": "Ali Mendjeli"
        }
    ],
    "revenue":[
        {
            "id" : 1,
            "user_id" : 1,
            "total_price" : 11000,
            "date": "01-04-2026",
            "exipire_date" : "20-09-2027"
        }
    ]
};
