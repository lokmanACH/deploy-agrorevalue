# Notification System Documentation

## Overview
A comprehensive notification system for both sellers and buyers that triggers on all relevant auction platform events.

## Notification Types

### For Sellers:
1. **new_bid** - A buyer placed a new bid on their product
   - Includes: product_id, buyer_id, quantity, price_per_kg, total_price
   
2. **product_closed** - Their product auction has ended
   - Includes: product_id, status
   
3. **product_sold** - Their product has been marked as sold
   - Includes: product_id, status
   
4. **product_expired** - Their product expired without sales
   - Includes: product_id, status

### For Buyers:
1. **bid_accepted** - Their bid was accepted and they won
   - Includes: product_id, allocation_id, quantity, final_price
   
2. **auction_closed** - An auction they bid on has closed (they didn't win)
   - Includes: product_id
   
3. **new_product_match** - A new product was listed matching their preferences
   - Includes: product_id, category_id
   
4. **product_deleted** - A product they bid on was deleted
   - Includes: product_id

## API Endpoints

### Get Unread Notifications Count
```
GET /api/notifications/unread?user_id=1
```
Response:
```json
{
  "count": 3,
  "notifications": [
    {
      "id": 1,
      "user_id": 1,
      "type": "new_bid",
      "message": "New bid on 'tomatos' from Ben Ali: 100kg @ 250 DZ/kg",
      "is_read": false,
      "created_at": "2026-04-20T14:06:45.964Z",
      "product_id": 1,
      "buyer_id": 24
    }
  ]
}
```

### Get All Notifications (Paginated)
```
GET /api/notifications?user_id=1&limit=50&offset=0
```
Response:
```json
{
  "total": 15,
  "unread": 3,
  "notifications": [...]
}
```

### Mark Single Notification as Read
```
PUT /api/notifications/5/read
```
Response:
```json
{
  "message": "Notification marked as read",
  "notification": { ... }
}
```

### Mark All Notifications as Read
```
PUT /api/notifications/read-all
Body: { "user_id": 1 }
```

### Delete Single Notification
```
DELETE /api/notifications/5
```

### Delete All Notifications for a User
```
DELETE /api/notifications?user_id=1
```

## Frontend Integration

### 1. Display Bell Icon with Unread Count
```typescript
const [unreadCount, setUnreadCount] = useState(0);
const [notifications, setNotifications] = useState([]);

useEffect(() => {
  const fetchNotifications = async () => {
    const res = await fetch(`/api/notifications/unread?user_id=${userId}`);
    const data = await res.json();
    setUnreadCount(data.count);
    setNotifications(data.notifications);
  };
  
  // Fetch on mount
  fetchNotifications();
  
  // Poll every 30 seconds
  const interval = setInterval(fetchNotifications, 30000);
  return () => clearInterval(interval);
}, [userId]);

return (
  <div className="bell-icon">
    🔔
    {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
  </div>
);
```

### 2. Display Notification Modal/Dropdown
```typescript
const handleNotificationClick = async () => {
  const res = await fetch(`/api/notifications?user_id=${userId}&limit=20`);
  const data = await res.json();
  setNotifications(data.notifications);
  setShowNotificationPanel(true);
};

const handleMarkAsRead = async (notificationId) => {
  await fetch(`/api/notifications/${notificationId}/read`, { method: 'PUT' });
  // Refresh list
  handleNotificationClick();
};

const getNotificationIcon = (type) => {
  switch(type) {
    case 'new_bid': return '💰';
    case 'bid_accepted': return '✅';
    case 'auction_closed': return '⏱️';
    case 'product_sold': return '🎉';
    case 'product_deleted': return '❌';
    case 'new_product_match': return '🆕';
    default: return '📬';
  }
};

return (
  <div className="notification-panel">
    {notifications.map(notif => (
      <div key={notif.id} className={`notification-item ${notif.is_read ? 'read' : 'unread'}`}>
        <span className="icon">{getNotificationIcon(notif.type)}</span>
        <div className="content">
          <p className="message">{notif.message}</p>
          <small>{new Date(notif.created_at).toLocaleString()}</small>
        </div>
        {!notif.is_read && (
          <button onClick={() => handleMarkAsRead(notif.id)}>✓</button>
        )}
      </div>
    ))}
  </div>
);
```

### 3. Real-time Updates (WebSocket)
For real-time notification updates without polling, extend the existing WebSocket connection:

```typescript
// In your WebSocket handler
ws.on('message', (msg) => {
  const data = JSON.parse(msg);
  
  if (data.type === 'notification') {
    // Update notification badge
    setUnreadCount(prev => prev + 1);
    // Optionally show toast/popup
    showToast(data.message);
  }
});
```

## Database Schema

```json
{
  "id": 1,
  "user_id": 1,
  "type": "new_bid",
  "message": "New bid on 'Product' from Buyer",
  "is_read": false,
  "created_at": "2026-04-20T14:06:45.964Z",
  "product_id": 5,
  "buyer_id": 24
}
```

## Event Triggers

| Event | Seller Notified | Buyer Notified |
|-------|-----------------|----------------|
| Bid Placed | ✅ new_bid | - |
| Product Created | - | ✅ (if matches preference) new_product_match |
| Bid Accepted | - | ✅ bid_accepted |
| Auction Closed | ✅ product_closed | ✅ (non-winners) auction_closed |
| Product Sold | ✅ product_sold | - |
| Product Expired | ✅ product_expired | - |
| Product Deleted | - | ✅ (all bidders) product_deleted |

## Implementation Notes

- Notifications are created automatically on CRUD operations
- All timestamps are in ISO 8601 format
- Notifications are never auto-deleted, only marked as read
- Metadata includes relevant IDs for deep linking to products/auctions
- No authentication required for reading own notifications (user_id query param)
- Consider adding user preferences for notification types later
