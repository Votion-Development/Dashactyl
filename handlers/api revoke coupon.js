/* eslint-disable no-mixed-operators */
module.exports.load = async function (app, ifValidAPI, ejs) {
  app.delete('/api/coupons/revoke_coupon/:coupon', async (req, res) => {
    if (req.session.data && req.session.data.panelinfo.root_admin || ifValidAPI(req, res, 'revoke coupon')) {
      const coupon = req.params.coupon
      if (coupon.length === 0) return res.json({ error: process.api_messages.coupons.invalidcoupon })

      if (!(await process.db.claimCoupon(coupon))) return res.json({ error: process.api_messages.coupons.invalidcoupon })

      return res.json({ error: process.api_messages.coupons.revokedcoupon })
    };
  })
}
