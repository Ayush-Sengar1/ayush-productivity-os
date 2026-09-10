function attachUser(req,res,next){res.locals.currentUser=req.session?.user||null;next()}
function requireAuth(req,res,next){if(!req.session?.user)return res.redirect('/login');next()}
function requireApiAuth(req,res,next){if(!req.session?.user)return res.status(401).json({error:'Authentication required'});next()}
module.exports={attachUser,requireAuth,requireApiAuth};
