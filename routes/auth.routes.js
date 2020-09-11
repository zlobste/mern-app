const {Router} = require('express');
const bcrypt = require('bcryptjs');
const {chaeck , validationResult} = require('express-validator');
const router = Router();
const User = require('./models/User');
const jwt = require('jsonwebtoken');
const config = require('config');


// /api/auth/register
router.post(
    '/register' ,
    [
        check('email', 'Некорректный email').IsEmail(),
        check('password', 'минимальная длинна пароля 6 символов')
            .IsLength({min: 6})
    ],

    async (req, res) =>{
     try{
         const errors = validationResult(req);
         if(!errors.isEmpty()){
             return res.status(400).json({
                 errors: array(),
                 message:'Некорректные данняе при регистрации'
             })
         }

         const {email , password} = req.body;

         const candidate = await User.findOne({email});

         if(candidate){
             res.status(400).json({message:'Такой пользователь существует уже'})
         }

         const hashedPassword = await bcrypt.hash(password, 12);
         const user = new User({email , password: hashedPassword});

         await  user.save;
         res.status(201).json({mesage:'Пользователь создан'});


     }catch (e) {
         res.status(500).json({message:'Что-то пошло не так...'})
     }

});

 router.post('/login',
     [
         check('email', 'Введите корректный email' ).normalizeEmail.isEmail(),
         check('password', 'Введите пароль' ).exists()
     ],
     async (req ,res) => {
         try{
             const errors = validationResult(req);
             if(!errors.isEmpty()){
                 return res.status(400).json({
                     errors: array(),
                     message:'Некорректные данняе при входе в систему'
                 })
             }

             const {email, password} = req.body;

             const user  =  await User.findOne({email});

             if(!user){
                 return res.status(400).json({message:'Пользователь не найден'});
             }

             const isMatch  =await bcrypt.compare(password , user.password);


             if(!isMatch){
                 return res.status(400).json({message:'Пароль неверный, попробуйте снова'});
             }

             const token = jwt.sign(
                 { userId:  user.id },
                 config.get('jwtSecret'),
                 { expiresIn:'1h'}
             );

             res.json({token, userId: user.id});



         }catch (e) {
             res.status(500).json({message:'Что-то пошло не так...'})
         }


 });


module.exports = router;