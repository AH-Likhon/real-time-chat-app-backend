const formidable = require('formidable');
const registerModel = require('../models/authModel');
const fs = require('fs');


module.exports.userRegister = async (req, res) => {

    
}

// fs.copyFile(files.image.path, newPath, async (error) => {
                    //     if (!error) {
                            

                            // const token = jwt.sign({
                            //     id: userCreate._id,
                            //     email: userCreate.email,
                            //     userName: userCreate.userName,
                            //     image: userCreate.image,
                            //     registerTime: userCreate.createAt
                            // }, process.env.SECRET, {
                            //     expiresIn: process.env.TOKEN_EXP
                            // });

                            // const options = {
                            //     expires: new Date(Date.now() + process.env.COOKIE_EXP * 24 * 60 * 60 * 1000)
                            // }

                            // res.status(201).cookie('authToken', token, options).json({
                            //     successMessage: 'Your Register successfull',
                            //     token
                            // })
                        // } else {
                        //     res.status(404).json({
                        //         error: {
                        //             errorMessage: ['Internal server error']
                        //         }
                        //     })
                        // }
        //             })
        //         }
        //     } catch (error) {
        //         res.status(404).json({
        //             error: {
        //                 errorMessage: ['Internal server error']
        //             }
        //         })
        //     }
        // }

// module.exports.userLogin = async (req, res) => {

//     const error = [];
//     const {
//         email,
//         password
//     } = req.body;
//     if (!email) {
//         error.push('Please provide your email')
//     }
//     if (!password) {
//         error.push('Please provide your password')
//     }
//     if (email && !validator.isEmail(email)) {
//         error.push('Please provide your valid email');
//     }
//     if (error.length > 0) {
//         res.status(400).json({
//             error: {
//                 errorMessage: error
//             }
//         });
//     } else {
//         try {
//             const checkUser = await registerModel.findOne({
//                 email: email
//             }).select('+password');

//             if (checkUser) {
//                 const matchPassword = await bcrypt.compare(password, checkUser.password);

//                 if (matchPassword) {
//                     const token = jwt.sign({
//                         id: checkUser._id,
//                         email: checkUser.email,
//                         userName: checkUser.userName,
//                         image: checkUser.image,
//                         registerTime: checkUser.createAt
//                     }, process.env.SECRET, {
//                         expiresIn: process.env.TOKEN_EXP
//                     });

//                     const options = {
//                         expires: new Date(Date.now() + process.env.COOKIE_EXP * 24 * 60 * 60 * 1000)
//                     }

//                     res.status(200).cookie('authToken', token, options).json({
//                         successMessage: 'Your login successfull',
//                         token
//                     })
//                 } else {
//                     res.status(400).json({
//                         error: {
//                             errorMessage: ['your password not valid']
//                         }
//                     });
//                 }
//             } else {
//                 res.status(400).json({
//                     error: {
//                         errorMessage: ['your email not found']
//                     }
//                 });
//             }

//         } catch (error) {
//             res.status(404).json({
//                 error: {
//                     errorMessage: ['Internal server error']
//                 }
//             });
//         }
//     }

// }

// module.exports.userLogout = (req,res)=>{
//     res.status(200).cookie('authToken', '').json({
//         success : true
//     })
// }