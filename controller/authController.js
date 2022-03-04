const formidable = require('formidable');
const validator = require('validator');
const fs = require('fs');
const bcrypt = require('bcrypt');

module.exports.registeredUser = (req, res) => {
    // console.log('user registered');

    const formData = formidable();
            formData.parse(req, async (err, fields, files) => {
                // console.log(fields);
                // console.log(files.image);

                const { userName, email, password, confirmPassword } = fields;
                const { image } = files;
                // console.log(image.originalFilename);

                const error = [];

                if(!userName){
                    error.push('Please, provide your user name');
                }
                if(!email || !validator.isEmail(email)){
                    error.push('Please, provide your valid email');
                }
                if(!password){
                    error.push('Please, provide your password');
                }
                if(!confirmPassword){
                    error.push('Please, fill out confirm password');
                }
                if(password && confirmPassword && password !== confirmPassword){
                    error.push("Password didn't match");
                }
                if(password && password.length < 6){
                    error.push('Password must be greater than 6 characters');
                }
                if(Object.keys(files).length === 0){
                    error.push('Please, provide your image')
                }
                if(error.length > 0){
                    res.status(400).json({error: { errorMessage: error}});
                }else{
                    const getImageName = image.originalFilename;
                    console.log(image.filepath)

                    const randomNumber = Math.floor(Math.random() * 99999);
                    const newImageName = randomNumber + getImageName;
                    files.image.originalFilename = newImageName;

                    const newPath = __dirname + `../frontend/public/images/${files.image.originalFilename}`;

                    try {
                        const checkUser = await registeredUser.findOne({email: email});

                        if(checkUser){
                            res.status(404).json({error:{errorMessage:['This already existed']}});
                        }else{
                            fs.copyFile(files.image.filepath, newPath, async (error) => {
                                if(!error){
                                    const userCreate = await registeredUser.insertOne({
                                        userName,
                                        email,
                                        password: await bcrypt.hash(password,10),
                                        image: files.image.originalFilename
                                    });
                                    console.log(userCreate);

                                    console.log('Registration successfully done');
                                }
                            })
                        }
                    } catch (error) {
                        console.log(error);
                    }

                }
            })
}