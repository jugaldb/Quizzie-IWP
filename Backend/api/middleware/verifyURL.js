const verifyURL = async (req, res, next) => {
    try {
        if (!req.body.captcha) {
            return res.status(400).json({
                message: "No recaptcha token",
            });
        }
        else {
            const verifyURL = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.reCaptchaSecret}&response=${req.body.captcha}`;
            req.verifyURL = verifyURL;
            next()
        }

    } 
}

module.exports = verifyURL