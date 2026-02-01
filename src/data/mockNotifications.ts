import { Notification } from '../types';

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: 'New message from Aziz Properties',
    message: 'Hello! I\'m interested in your property. Can you send me more photos?',
    type: 'message',
    timestamp: new Date(Date.now() - 5 * 60000).toISOString(), // 5 mins ago
    read: false,
    actionUrl: '/messages/1',
    icon: 'message',
    userId: 'user_123',
  },
  {
    id: '2',
    title: 'Your property has been liked',
    message: 'Someone liked your Modern 3-Bedroom Apartment with City View property',
    type: 'like',
    timestamp: new Date(Date.now() - 30 * 60000).toISOString(), // 30 mins ago
    read: false,
    actionUrl: '/properties/abc123',
    icon: 'heart',
    userId: 'user_456',
  },
  {
    id: '3',
    title: 'New listing matches your preferences',
    message: 'A new 2-bedroom apartment in Mirzo Ulugbek has been listed for $150,000',
    type: 'new_listing',
    timestamp: new Date(Date.now() - 2 * 3600000).toISOString(), // 2 hours ago
    read: true,
    actionUrl: '/properties/xyz789',
    icon: 'home',
    userId: 'user_789',
  },
  {
    id: '4',
    title: 'Booking request received',
    message: 'John Smith wants to visit your property tomorrow at 3:00 PM',
    type: 'booking',
    timestamp: new Date(Date.now() - 4 * 3600000).toISOString(), // 4 hours ago
    read: true,
    actionUrl: '/bookings/1',
    icon: 'calendar',
    userId: 'user_101',
  },
  {
    id: '5',
    title: 'Payment successful',
    message: 'Your premium subscription has been renewed successfully',
    type: 'success',
    timestamp: new Date(Date.now() - 6 * 3600000).toISOString(), // 6 hours ago
    read: true,
    actionUrl: '/subscription',
    icon: 'check-circle',
    userId: 'user_111',
  },
  {
    id: '6',
    title: 'Profile update required',
    message: 'Please update your profile photo to complete verification',
    type: 'warning',
    timestamp: new Date(Date.now() - 1 * 86400000).toISOString(), // 1 day ago
    read: false,
    actionUrl: '/profile/edit',
    icon: 'alert-circle',
    userId: 'user_222',
  },
  {
    id: '7',
    title: 'New property in your neighborhood',
    message: 'A 4-bedroom house in Chilanzar has been listed for $320,000',
    type: 'new_listing',
    timestamp: new Date(Date.now() - 2 * 86400000).toISOString(), // 2 days ago
    read: true,
    actionUrl: '/properties/abc456',
    icon: 'home',
    userId: 'user_333',
  },
  {
    id: '8',
    title: 'Welcome to Makler App!',
    message: 'Thank you for joining our community. Start by exploring properties or listing your own.',
    type: 'info',
    timestamp: new Date(Date.now() - 3 * 86400000).toISOString(), // 3 days ago
    read: true,
    actionUrl: '/getting-started',
    icon: 'info',
    userId: 'user_444',
  },
  {
    id: '9',
    title: 'Service interruption notice',
    message: 'We\'ll be performing maintenance on Saturday from 2 AM to 4 AM',
    type: 'warning',
    timestamp: new Date(Date.now() - 4 * 86400000).toISOString(), // 4 days ago
    read: true,
    actionUrl: '/maintenance-schedule',
    icon: 'alert-triangle',
    userId: 'user_555',
  },
  {
    id: '10',
    title: 'New feature: Saved searches',
    message: 'You can now save your search criteria and get notified when new matches appear',
    type: 'info',
    timestamp: new Date(Date.now() - 5 * 86400000).toISOString(), // 5 days ago
    read: true,
    actionUrl: '/features/saved-searches',
    icon: 'bell',
    userId: 'user_666',
  },
];

export default MOCK_NOTIFICATIONS;