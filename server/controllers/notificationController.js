const Notification = require('../models/Notification');

// Get all notifications for a farmer
exports.getFarmerNotifications = async (req, res) => {
  try {
    const farmerId = req.params.farmerId || req.user.uid;
    
    const notifications = await Notification.find({ farmerId })
      .populate('orderId', 'orderId total status')
      .sort({ createdAt: -1 })
      .limit(50); // Limit to last 50 notifications
    
    console.log(`✅ Fetched ${notifications.length} notifications for farmer: ${farmerId}`);
    res.json({ ok: true, notifications });
  } catch (err) {
    console.error('❌ Get notifications error:', err);
    res.status(500).json({ ok: false, error: 'Failed to fetch notifications' });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { read: true },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ ok: false, error: 'Notification not found' });
    }
    
    console.log(`✅ Notification marked as read: ${notificationId}`);
    res.json({ ok: true, notification });
  } catch (err) {
    console.error('❌ Mark as read error:', err);
    res.status(500).json({ ok: false, error: 'Failed to mark notification as read' });
  }
};

// Mark all notifications as read for a farmer
exports.markAllAsRead = async (req, res) => {
  try {
    const farmerId = req.params.farmerId || req.user.uid;
    
    const result = await Notification.updateMany(
      { farmerId, read: false },
      { read: true }
    );
    
    console.log(`✅ Marked ${result.modifiedCount} notifications as read for farmer: ${farmerId}`);
    res.json({ ok: true, count: result.modifiedCount });
  } catch (err) {
    console.error('❌ Mark all as read error:', err);
    res.status(500).json({ ok: false, error: 'Failed to mark all notifications as read' });
  }
};

// Get unread notification count
exports.getUnreadCount = async (req, res) => {
  try {
    const farmerId = req.params.farmerId || req.user.uid;
    
    const count = await Notification.countDocuments({ farmerId, read: false });
    
    res.json({ ok: true, count });
  } catch (err) {
    console.error('❌ Get unread count error:', err);
    res.status(500).json({ ok: false, error: 'Failed to get unread count' });
  }
};

// Delete a notification
exports.deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    const notification = await Notification.findByIdAndDelete(notificationId);
    
    if (!notification) {
      return res.status(404).json({ ok: false, error: 'Notification not found' });
    }
    
    console.log(`✅ Notification deleted: ${notificationId}`);
    res.json({ ok: true, message: 'Notification deleted' });
  } catch (err) {
    console.error('❌ Delete notification error:', err);
    res.status(500).json({ ok: false, error: 'Failed to delete notification' });
  }
};
