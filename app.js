var    express         = require('express'),
       bodyParser     = require('body-parser'),
       bcrypt         = require('bcrypt-nodejs'),
       flash          = require('connect-flash'),
       session        = require('express-session'),
       passport       = require('passport'),
       cookieParser   = require('cookie-parser'),
       connection     = require('./models/database');       

var app=express();

app.use(session({  secret:"This is the secret key"  , saveUninitialized:false , resave:false   }));
app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine','ejs');
app.use(express.static(__dirname + '/public'));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());

require('./models/passport')(passport);  

app.get('/',(req,res)=>{
      console.log(connection.state);
      res.render('index');
});

app.get('/login',(req,res)=>{
      res.render('login' , { loginError:req.flash('loginMessage') , 
                             forgot:req.flash('forgot') , 
                             forgotPasswordGenerated:req.flash('forgotPasswordGenerated') ,
                             errorForgotPasswordInput:req.flash('errorForgotPasswordInput')
                          } ); 
});

app.post('/login',passport.authenticate('local-login',{ failureRedirect:'/login' , failureFlash:true }) , 
                                        function(req,res) {     
                                                               res.redirect('/home');
                                                          });

app.get('/home', checkAuthentication , function(req,res){
      res.render('home' , { user:req.user });
});

app.get('/logout',function(req,res){
  if(req.user)
  {
     req.logout();
  }   
  res.redirect('/login');
});

function checkAuthentication(req,res,next)
{
    if(req.isAuthenticated())      // req.isAuthenticated() will return true if user is logged in
    {
       next();
    } 
    else
    {
       res.redirect("/login");
    }
}

app.get('/register',(req,res)=>{
      res.render('register',{ registrationError:req.flash('registrationError') });    
});

app.post('/register',(req,res)=>{
      
      var newUser=
      {     
          email:req.body.email,
          password:bcrypt.hashSync(req.body.password,null),
          fname:req.body.fname,
          lname:req.body.lname,
          bio:req.body.bio
      }
      console.log(newUser);
      connection.query("SELECT * from user WHERE email = ?",[newUser.email],function(err,rows){
             console.log(rows);  
             if(err){
                   console.log(err);
             }
             if(rows.length){
                   
                  req.flash('registrationError','User Already Exists');
                  res.redirect('/register');
              } else{
                  var sqlQuery="INSERT INTO user(email,fname,lname,bio,password) VALUES(?,?,?,?,?)";
                  connection.query(sqlQuery,[newUser.email,newUser.fname,newUser.lname,newUser.bio,newUser.password],function(err,rows){
                        if(rows.affectedRows == 1)
                        {
                           res.redirect('/login');  
                        }    
                  });
             }
      });
});


app.get('/forgot',function(req,res){
       req.flash('forgot','forgotPass');
       res.redirect('/login');
});

app.post('/forgot',function(req,res){
       var email= req.body.email;
       connection.query("SELECT * from user WHERE email = ? ",[email],function(err,rows){
            

             
             if(!rows.length){    
                   console.log('Email not compared');
                   req.flash('errorForgotPasswordInput','Invalid email address.');
                   res.redirect('/login');
             }
             else{
                  console.log('Email compared');
                  req.flash('forgotPasswordGenerated','You will Shortly receive email containing link to set Password. Kindly Check your email.');
                  res.redirect('/login');
             }
       });
});

app.listen(3000,()=>{
        console.log("Server on Port 3000");
});

