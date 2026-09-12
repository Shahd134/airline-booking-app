// بيلف أي async controller ويبعت أي خطأ للـ error middleware المركزي
// بدل ما نكرر try/catch في كل كنترولر
module.exports = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
