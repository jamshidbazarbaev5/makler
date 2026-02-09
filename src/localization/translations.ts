export type Language = 'uz' | 'ru' | 'en';

export interface Translations {
  // Notifications Screen
  notifications: string;
  markAllAsRead: string;
  clearAll: string;
  all: string;
  unread: string;
  noNotificationsYet: string;
  noUnreadNotifications: string;
  whenYouGetNotifications: string;
  showAllNotifications: string;

  // Notification types
  postPublished: string;
  postRejected: string;

  // Notification messages
  postApprovedMessage: (title: string) => string;
  postRejectedMessage: (title: string, reason: string) => string;

  // Rejection Reason Sheet
  rejectionReason: string;
  canEditAndResubmit: string;
  understood: string;

  // Common
  close: string;
  loading: string;
  error: string;
  refresh: string;
}

export const translations: Record<Language, Translations> = {
  uz: {
    // Notifications Screen
    notifications: 'Bildirishnomalar',
    markAllAsRead: "Barchasini o'qilgan qilib belgilash",
    clearAll: 'Hammasini tozalash',
    all: 'Hammasi',
    unread: "O'qilmagan",
    noNotificationsYet: 'Hali bildirishnomalar yo\'q',
    noUnreadNotifications: "O'qilmagan bildirishnomalar yo'q",
    whenYouGetNotifications: 'Bildirishnomalar kelganda, ular shu yerda ko\'rinadi',
    showAllNotifications: 'Barcha bildirishnomalarni ko\'rsatish',

    // Notification types
    postPublished: 'E\'lon nashr etildi',
    postRejected: 'E\'lon rad etildi',

    // Notification messages
    postApprovedMessage: (title: string) => `E'loningiz "${title}" tasdiqlandi va jonli efirga chiqdi!`,
    postRejectedMessage: (title: string, reason: string) => `E'loningiz "${title}" rad etildi. Sabab: ${reason}`,

    // Rejection Reason Sheet
    rejectionReason: 'Rad etish sababi:',
    canEditAndResubmit: "E'loningizni tahrirlashingiz va qayta yuborishingiz mumkin. Iltimos, yuqoridagi sabablarga e'tibor bering.",
    understood: 'Tushunarli',

    // Common
    close: 'Yopish',
    loading: 'Yuklanmoqda...',
    error: 'Xatolik',
    refresh: 'Yangilash',
  },

  ru: {
    // Notifications Screen
    notifications: 'Уведомления',
    markAllAsRead: 'Отметить все как прочитанные',
    clearAll: 'Очистить все',
    all: 'Все',
    unread: 'Непрочитанные',
    noNotificationsYet: 'Уведомлений пока нет',
    noUnreadNotifications: 'Нет непрочитанных уведомлений',
    whenYouGetNotifications: 'Когда вы получите уведомления, они появятся здесь',
    showAllNotifications: 'Показать все уведомления',

    // Notification types
    postPublished: 'Объявление опубликовано',
    postRejected: 'Объявление отклонено',

    // Notification messages
    postApprovedMessage: (title: string) => `Ваше объявление "${title}" одобрено и опубликовано!`,
    postRejectedMessage: (title: string, reason: string) => `Ваше объявление "${title}" отклонено. Причина: ${reason}`,

    // Rejection Reason Sheet
    rejectionReason: 'Причина отклонения:',
    canEditAndResubmit: 'Вы можете отредактировать и повторно отправить ваше объявление. Пожалуйста, обратите внимание на причины выше.',
    understood: 'Понятно',

    // Common
    close: 'Закрыть',
    loading: 'Загрузка...',
    error: 'Ошибка',
    refresh: 'Обновить',
  },

  en: {
    // Notifications Screen
    notifications: 'Notifications',
    markAllAsRead: 'Mark all as read',
    clearAll: 'Clear all',
    all: 'All',
    unread: 'Unread',
    noNotificationsYet: 'No notifications yet',
    noUnreadNotifications: 'No unread notifications',
    whenYouGetNotifications: 'When you get notifications, they will appear here',
    showAllNotifications: 'Show all notifications',

    // Notification types
    postPublished: 'Post Published',
    postRejected: 'Post Rejected',

    // Notification messages
    postApprovedMessage: (title: string) => `Your post "${title}" has been approved and is now live!`,
    postRejectedMessage: (title: string, reason: string) => `Your post "${title}" was rejected. Reason: ${reason}`,

    // Rejection Reason Sheet
    rejectionReason: 'Rejection reason:',
    canEditAndResubmit: 'You can edit and resubmit your post. Please pay attention to the reasons above.',
    understood: 'Understood',

    // Common
    close: 'Close',
    loading: 'Loading...',
    error: 'Error',
    refresh: 'Refresh',
  },
};
