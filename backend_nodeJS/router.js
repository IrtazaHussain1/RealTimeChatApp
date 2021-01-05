const express =  require('express');
const router =  express.Router();

router.get('/',(req,res)=>{
    res.json({'info':'Server is running yeah....'});
});

module.exports = router;