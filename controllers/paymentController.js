import sha512 from 'js-sha512';

const OPAY_URL = "https://testapi.opaycheckout.com/api/v1/international/payment/create"
const RETURN_URL ="https://rgh32pns-5000.uks1.devtunnels.ms/payment/web/hook"
async function create_payment(body) {
    console.log("_____REQUEST BODY:: ", parseInt(body.amount));
    const formData = {
        amount: {
            currency: "NGN",
            total: parseInt(body.amount) || 1000
        },
        callbackUrl: RETURN_URL,
        country: "NG",
        customerName: "customerName",
        payMethod: "BankTransfer",
        product: {
            description: "dd",
            name: "name"
        },
        reference: "123456",
        userInfo: {
            userEmail: "akanbijosephtobi@gmail.com",
            userId: "userid001",
            userMobile: "09064923080",
            userName: "BoyX"
        },
        userPhone: "+2349064923080"
    };

    const hash = sha512.hmac.create(process.env.O_SECRET);
    hash.update(JSON.stringify(formData));
    const hmacsignature = hash.hex();

    try {
        const response = await fetch(OPAY_URL, {
            method: 'POST',
            headers: {
                'MerchantId': '281825050998500',
                'Authorization': 'Bearer ' + hmacsignature,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
        }

        const responseBody = await response.json();
        console.log('Response Body:', responseBody);
        return responseBody;

    } catch (error) {
        console.error('Error:', error.message);
        throw error;
    }
}


export async function payment_create_payment(req, res) {

    try {
        
        const response = await create_payment(req.body)
        console.log('WE GOOD:', response)
        res.status(200).json({message:'we Good'});
    } catch (error) {
        console.log(error.message)
        res.status(400).json({error:true, message:error?.message||'Something went wrong!!'});
    }
 
}

export async function payment_webhook(req, res) {

    try {
        console.log('WE GOOD INIT WHOOK')
        res.status(200).json({message:'we Good'});
    } catch (error) {
        res.status(400).json({error:true, message:error?.message||'Something went wrong!!'});
    }
 
}



