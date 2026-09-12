module.exports = {
  // أقل عدد ساعات قبل الإقلاع مسموح فيها بالإلغاء المجاني
  FREE_CANCELLATION_CUTOFF_HOURS: 24,
  // أقل عدد ساعات قبل الإقلاع مسموح فيها بالإلغاء نهائيًا (بعدها ممنوع تمامًا)
  LAST_CANCELLATION_CUTOFF_HOURS: 3,
  // نسبة الاسترداد لو الإلغاء بعد الفترة المجانية لكن قبل آخر موعد
  PARTIAL_REFUND_PERCENTAGE: 50,
};
