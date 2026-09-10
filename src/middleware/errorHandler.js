function notFound(req,res){if(req.path.startsWith('/api/'))return res.status(404).json({error:'Not found'});res.status(404).render('404',{pageTitle:'Not found'});}
function errorHandler(err,req,res,next){console.error(err);const message=process.env.NODE_ENV==='production'?'Something went wrong.':err.message;if(req.path.startsWith('/api/'))return res.status(500).json({error:message});res.status(500).render('error',{pageTitle:'Something went wrong',message});}
module.exports={notFound,errorHandler};
