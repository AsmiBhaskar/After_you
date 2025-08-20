# Legacy Chain Feature

Body:
{
  "sender_name": "John Doe",
  "recipient_email": "next@example.com",
  "content": "Thank you for sharing this. I'd like to add..."
}

Response:
{
  "success": true,
  "message": "Message added to chain successfully",
  "chain_generation": 2,
  "message_id": "68a2133fddcee66e006f44fc"
}
```

## Email Templates

### Original Messages
- Use standard legacy message template
- Include link to view and extend the legacy

### Chain Messages
- Use special chain template with purple theme
- Show generation number and who added it
- Include buttons for viewing, extending, and viewing full chain

## Frontend Components

### Chain Message View (`/legacy/message/<token>/`)
- Displays the message content
- Shows chain information (generation, sender)
- Provides forms to extend the chain
- Shows chain history

### Key Features
- Responsive design
- AJAX form submission
- Error handling
- Success feedback
- Chain visualization

## Usage Examples

### User Journey
1. **Alice** creates a legacy message for her daughter **Beth**
2. **Beth** receives the email and clicks the link
3. **Beth** reads Alice's message and adds her own thoughts
4. **Beth** sends the extended chain to her daughter **Carol**
5. **Carol** can see both Alice's and Beth's messages
6. **Carol** can add her own message and pass it to her daughter
7. The chain continues across generations...

### Use Cases
- **Family Traditions**: Pass down family stories and values
- **Milestone Messages**: Graduation, marriage, birth celebrations
- **Memory Preservation**: Important life lessons and experiences
- **Cultural Heritage**: Preserve cultural stories and wisdom
- **Professional Legacy**: Pass down career advice and experiences

## Security Features

### Access Control
- Each message has a unique access token
- Only token holders can view/extend the message
- No authentication required for recipients
- Tokens are cryptographically secure UUIDs

### Privacy
- Original message creators can see all chain activity
- Recipients only see the specific message sent to them
- Chain history is available to all participants
- Email addresses are not exposed in the chain view

## Technical Implementation

### Database Indexing
```python
meta = {
    'indexes': ['chain_id', 'parent_message', 'recipient_access_token', 'generation']
}
```

### Email Service Updates
- Automatic template selection based on message type
- Chain-specific email styling and content
- Embedded access links for all chain functions

### Task Queue Integration
- Chain messages are queued for immediate delivery
- Background processing for email sending
- Proper error handling and retry logic

## Configuration

### Settings Required
```python
FRONTEND_URL = 'http://localhost:8000'  # For email links
```

### Email Templates
- `legacy/email_template.html` - Original messages
- `legacy/chain_email_template.html` - Chain messages
- `legacy/chain_message_view.html` - Web interface

## Testing

### Test Script
Run the included test script to create sample chains:
```bash
python test_chain.py
```

### Manual Testing
1. Start the Django server: `python manage.py runserver`
2. Visit the generated chain URL
3. Test the "Add Your Message & Pass It Forward" feature
4. Verify email sending (check console if using console backend)
5. Test chain history viewing

## Future Enhancements

### Potential Features
- **Chain Analytics**: Track chain statistics and engagement
- **Media Support**: Allow images, videos, and documents in chains
- **Chain Templates**: Pre-defined chain types for different occasions
- **Chain Limits**: Set maximum chain length or time limits
- **Notification Settings**: Notify original creators of chain activity
- **Chain Branches**: Allow multiple paths from one message
- **Social Features**: Public chain sharing and discovery

### API Improvements
- Pagination for long chains
- Search and filtering within chains
- Chain export functionality
- Chain archiving and restoration

## Troubleshooting

### Common Issues
1. **Access Token Not Found**: Check URL formatting and token validity
2. **Email Not Sending**: Verify SMTP configuration and email service setup
3. **Chain Not Loading**: Check MongoDB connection and model indexes
4. **Form Submission Fails**: Verify API endpoint URLs and CORS settings

### Debug Tips
- Check Django logs for detailed error messages
- Use browser developer tools to inspect API calls
- Verify database entries using Django shell or MongoDB client
- Test email delivery using Django's console backend first

## License

This feature is part of the AfterYou Legacy Messages project.
