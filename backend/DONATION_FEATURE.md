# Donation Feature - Backend Implementation Guide

This document outlines the backend endpoints and database changes needed to support the donation feature in the seller dashboard.

## Database Schema

### Organizations Table
```sql
CREATE TABLE organizations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  address VARCHAR(255),
  website VARCHAR(255),
  mission TEXT,
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Donations Table
```sql
CREATE TABLE donations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  seller_id INT NOT NULL,
  organization_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  message TEXT,
  status ENUM('pending', 'accepted', 'rejected', 'completed') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (seller_id) REFERENCES users(id),
  FOREIGN KEY (organization_id) REFERENCES organizations(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);
```

### Donation Contacts Table
```sql
CREATE TABLE donation_contacts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  seller_id INT NOT NULL,
  organization_id INT NOT NULL,
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  status ENUM('unread', 'read', 'replied') DEFAULT 'unread',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (seller_id) REFERENCES users(id),
  FOREIGN KEY (organization_id) REFERENCES organizations(id)
);
```

## API Endpoints

### GET /api/organizations
- **Description**: Get all charitable organizations
- **Response**: Array of organization objects
- **Example Response**:
```json
[
  {
    "id": 1,
    "name": "Croissant Rouge Algérien",
    "description": "Organisation humanitaire",
    "email": "contact@cra.dz",
    "phone": "+213 21 23 45 67",
    "address": "Alger, Algérie",
    "website": "www.cra.dz",
    "mission": "Aide humanitaire"
  }
]
```

### POST /api/donations
- **Description**: Create a new donation
- **Authentication**: Required (seller)
- **Body**:
```json
{
  "seller_id": 1,
  "organization_id": 1,
  "product_id": 5,
  "quantity": 10,
  "message": "Optional donation message",
  "organization_email": "contact@org.dz",
  "organization_name": "Organization Name"
}
```
- **Actions**:
  - Save donation to database
  - Send email to organization with donation details
  - Return success/error response

### POST /api/donations/contact
- **Description**: Send a message to an organization
- **Authentication**: Required (seller)
- **Body**:
```json
{
  "seller_id": 1,
  "organization_id": 1,
  "subject": "Partnership inquiry",
  "message": "Message content",
  "organization_email": "contact@org.dz",
  "organization_name": "Organization Name"
}
```
- **Actions**:
  - Save contact message to database
  - Send email to organization
  - Return success/error response

### GET /api/donations/seller/:seller_id
- **Description**: Get all donations by a seller
- **Authentication**: Required
- **Response**: Array of donation objects with status

### GET /api/organizations/:id
- **Description**: Get specific organization details
- **Response**: Organization object with full details

## Email Templates

### Donation Notification Email
Sent to organization when a seller creates a donation:
```
Subject: Nouvelle donation reçue

From: {seller_name}
Product: {product_name}
Quantity: {quantity}
Quality: {product_quality}
Message: {donation_message}

The seller contact information will be in the system.
```

### Contact Request Email
Sent to organization when a seller sends a contact message:
```
Subject: {contact_subject}

From: {seller_name}
Message: {message}

You can reply directly to the seller through the platform.
```

## Implementation Notes

1. **Authentication**: All donation endpoints require seller authentication
2. **Email Service**: Integrate with your email service (e.g., Nodemailer, SendGrid)
3. **Validation**: 
   - Validate quantity doesn't exceed product availability
   - Validate seller owns the products they're donating
   - Validate organization email is correct
4. **Status Tracking**: Organizations can accept/reject/mark donations as completed
5. **Notifications**: Consider adding real-time notifications for organizations receiving donations

## Frontend Integration

The frontend donation page includes:
- **Donations Page**: `/seller/donations`
- **Components**:
  - `CharitableOrganizations`: Display list of organizations
  - `DonationForm`: Modal for making donations
  - `DonationContactModal`: Modal for contacting organizations
- **Features**:
  - View all organizations
  - Make donations with product selection
  - Specify quantity and optional message
  - Contact organizations directly

## Testing

1. Test donation creation with valid data
2. Test validation (quantity limits, authentication)
3. Test email notifications
4. Test contact message sending
5. Test error handling for invalid organizations/products
