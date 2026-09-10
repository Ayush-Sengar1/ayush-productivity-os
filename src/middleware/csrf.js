const crypto=require('node:crypto');
function issue(req,res,next){if(!req.session.csrfToken)req.session.csrfToken=crypto.randomBytes(32).toString('hex');res.locals.csrfToken=req.session.csrfToken;next()}
function safeMethod(method){return ['GET','HEAD','OPTIONS'].includes(method)}
function verify(req,res,next){if(safeMethod(req.method))return next();const supplied=req.get('x-csrf-token')||(req.body&&req.body._csrf)||'';const expected=req.session.csrfToken||'';const valid=supplied&&expected&&supplied.length===expected.length&&crypto.timingSafeEqual(Buffer.from(supplied),Buffer.from(expected));if(valid)return next();if(req.path.startsWith('/api/'))return res.status(403).json({error:'Invalid or missing CSRF token.'});return res.status(403).render('error',{pageTitle:'Request blocked',message:'Your form security token expired. Refresh and try again.'})}
module.exports={issue,verify};
