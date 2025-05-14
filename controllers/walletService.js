
import Transaction from '../models/Transaction.js';



export async function get_user_transactions(req, res) {

    try {
        const result = await Transaction.find({user:req.user._id}).sort({createdAt:-1})
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({error:true, message:error?.message||'Something went wrong!!'});
    }
 
}