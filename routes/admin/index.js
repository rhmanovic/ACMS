var express = require('express');
var router = express.Router();
var User = require('../../models/user');
var Chapter = require('../../models/chapter');
var Course = require('../../models/course');
var Teacher = require('../../models/teacher');
var Charge = require('../../models/charge');
var mid = require('../../middleware');
var fs = require('fs');
var path = require('path');
var multer = require('multer');

// dublicted in app an admin
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log(req.body);
    if (req.body.chapterId){
      cb(null, path.join(__dirname, '../../public/products/',req.body.chapterId))
    } else if (req.body.courseId) {
      cb(null, path.join(__dirname, '../../public/courses'))
    }
  },
  // destination: '../../privates/upLoads',
  // destination: path.join(__dirname, '../../privates/upLoads'),// this works check the path method again
  // destination: '../../privates/upLoads',// this works check the path method again
  filename: function(req,file,cb){
    cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});
// init upload
const upload = multer({
  storage: storage,
  limits: {fileSize: 100000000}, // this Number is Bytes //it's error msg not OK
  fileFilter: function(req, file, cb){
    chickFileType(file, cb);
  }
}).single('myFile');

function chickFileType(file, cb){
  // allowed Extensions
  const fileType = /jpeg|jpg|png|gif|mp4/; // need to be modified for videos
  // check ext
  const extname = fileType.test(path.extname(file.originalname).toLowerCase());
  // check mime
  const mimetype = fileType.test(file.mimetype);
  
  if(mimetype && extname){
    return cb(null,true); // null of error, true for call back
  } else {
    cb ('Error: Images Only!'); // need to be modified for videos
  }
}

function addLinkToChapter(chapterId,filename, res){
  arr_update_dict = { "$set": {} }; 
  arr_update_dict["$set"]["sectionsLinks."+0] = '../../products/'+chapterId+'/'+filename ;
  Chapter.findOneAndUpdate({_id: chapterId},arr_update_dict).then(function(){
    res.redirect('back')
  }).catch(function(error){
    return next(error);
  });
}

function addLinkCourse(courseId,filename,res){
  arr_update_dict = { "$set": {} }; 
  arr_update_dict["$set"]["img"] = '../../courses'+'/'+filename ;
  Course.findOneAndUpdate({_id: courseId},arr_update_dict).then(function(){
    res.redirect('back')
  }).catch(function(error){
    return next(error);
  });
}


// up load // Section
router.post('/upLoad/:chapterId/', mid.requiresLogin, function(req, res, next) {
  const {chapterId} = req.params;
  // var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
  upload(req, res, (err) => {
    if(err){
      res.send(err);
    }else {
      if (req.file){
        const filename = req.file.filename;
        addLinkToChapter(chapterId,filename,res)
      } else {
        res.send(`Error: No file selected`)
      }
    }
  })
})

// up load // imgCourse
router.post('/imgCourse/:courseId/', mid.requiresLogin, function(req, res, next) {
  const {courseId} = req.params;
  console.log ("router.post('/imgCourse/"+courseId)
  // var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
  upload(req, res, (err) => {
    if(err){
      res.send(err);
    }else {
      if (req.file){
        const filename = req.file.filename;
        addLinkCourse(courseId,filename,res)
      } else {
        res.send(`Error: No file selected`)
      }
    }
  })
})

// up load // AddImgLink
router.post('/deleteImgLink', mid.requiresAdmin, function(req, res, next) {
  
  var chapterId = req.body.chapterId;
  // const {chapterId} = req.params;
  var imgLink = "";
  console.log("Post deleteImgLink");
  console.log("chapterId: "+chapterId);
  console.log("imgLink: "+imgLink);

  arr_update_dict = { "$set": {} }; 
  arr_update_dict["$set"]["sectionsLinks."+0] = imgLink ;
  Chapter.findOneAndUpdate({_id: chapterId},arr_update_dict).then(function(){
    res.redirect('back')
  }).catch(function(error){
    return next(error);
  });
})

//Get // deleteImgLink
router.get('/deleteImgLink/:chapterId/',mid.requiresAdmin, function(req, res){
  const {chapterId} = req.params;
  console.log('deleteImgLink:' + chapterId);
  return res.render('admin/forms/deleteImgLink', { title: 'here we are',chapterId:chapterId});
})

// up load // AddImgLink
router.post('/AddImgLink', mid.requiresAdmin, function(req, res, next) {
  
  var chapterId = req.body.chapterId;
  // const {chapterId} = req.params;
  var imgLink = req.body.imgLink
  console.log("Post AddImgLink");
  console.log("chapterId: "+chapterId);
  console.log("imgLink: "+imgLink);

  arr_update_dict = { "$set": {} }; 
  arr_update_dict["$set"]["sectionsLinks."+0] = imgLink ;
  Chapter.findOneAndUpdate({_id: chapterId},arr_update_dict).then(function(){
    res.redirect('back')
  }).catch(function(error){
    return next(error);
  });
})

//Get // AddImgLink
router.get('/AddImgLink/:chapterId/',mid.requiresAdmin, function(req, res){
  const {chapterId} = req.params;
  console.log('AddImgLink:' + chapterId);
  return res.render('admin/forms/AddImgLink', { title: 'here we are',chapterId:chapterId});
})

//Get // imgCourse
router.get('/imgCourse/:courseId/',mid.requiresAdmin, function(req, res){
  const {courseId} = req.params;
  console.log('imgcourse:' + courseId);
  return res.render('admin/forms/upLoad', { title: 'here we are',courseId:courseId});
})

router.get('/AddSection/:chapterId',mid.requiresAdmin, function(req, res){
  const {chapterId} = req.params;
  console.log("xxx ___" + chapterId)

  return res.render('admin/forms/AddSection', { title: 'here we are',chapterId:chapterId});

});

router.post('/AddSection', mid.requiresLogin, function(req, res, next) {
  // var SectionIndex = req.body.SectionIndex;
  var chapterId = req.body.chapterId;
  var sectionName = req.body.sectionName

  console.log("sectionName " + sectionName)
  console.log("chapterId " + chapterId)
  Chapter.findOneAndUpdate({_id: chapterId},
    {$push:
      {
        sections: sectionName,
        sectionsLinks: null,
      }
    }).then(function(){
    res.redirect('back')
  }).catch(function(error){
    return next(error);
  });


  
});

router.get('/deletSection/:chapterId/:action',mid.requiresAdmin, function(req, res){
  const {chapterId} = req.params;
  const {action} = req.params;

  arr_update_dict = { "$set": {} }; 

  switch(action) {
  case 'deletLink':
    break;
  case 'deletSection':
    break;
  case 'addLink':
    break;
  case 'renameSection':
    break;
  case 'upLoad':
      return res.render('admin/forms/upLoad', { title: 'here we are',chapterId:chapterId});
    break;
  default:
    // code block
  }
});


//Get // editDescription
router.get('/editDescription/:chapterId/',mid.requiresAdmin, function(req, res){
  const {chapterId} = req.params;
  return res.render('admin/forms/editDescription', { title: 'here we are',chapterId:chapterId});
})

router.post('/editDescription', mid.requiresLogin, function(req, res, next) {
  var chapterId = req.body.chapterId;
  var description = req.body.description

  arr_update_dict = { "$set": {} }; 
  arr_update_dict["$set"]["description"] = description ;
  Chapter.findOneAndUpdate({_id: chapterId},arr_update_dict).then(function(){
    res.redirect('back')
  })
});

//////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////

//Get // editPrice
router.get('/editPrice/:chapterId/',mid.requiresAdmin, function(req, res){
  const {chapterId} = req.params;
  return res.render('admin/forms/editPrice', { title: 'here we are',chapterId:chapterId});
})

router.post('/editPrice', mid.requiresLogin, function(req, res, next) {
  var chapterId = req.body.chapterId;
  var price = req.body.price

  arr_update_dict = { "$set": {} }; 
  arr_update_dict["$set"]["price"] = price ;
  Chapter.findOneAndUpdate({_id: chapterId},arr_update_dict).then(function(){
    res.redirect('back')
  })
});
//////////////////////////////////////////////////////////////////////

//Get // edit_showInHomePage
router.get('/edit_showInHomePage/:chapterId/',mid.requiresAdmin, function(req, res){
  const {chapterId} = req.params;
  return res.render('admin/forms/edit_showInHomePage', { title: 'here we are',chapterId:chapterId});
})

router.post('/edit_showInHomePage', mid.requiresLogin, function(req, res, next) {
  var chapterId = req.body.chapterId;
  var showInHomePage = req.body.showInHomePage

  arr_update_dict = { "$set": {} }; 
  arr_update_dict["$set"]["showInHomePage"] = showInHomePage ;
  Chapter.findOneAndUpdate({_id: chapterId},arr_update_dict).then(function(){
    res.redirect('back')
  })
});
//////////////////////////////////////////////////////////////////////

//Get // edit_priceBeforDiscount
router.get('/edit_priceBeforDiscount/:chapterId/',mid.requiresAdmin, function(req, res){
  const {chapterId} = req.params;
  return res.render('admin/forms/edit_priceBeforDiscount', { title: 'here we are',chapterId:chapterId});
})

router.post('/edit_priceBeforDiscount', mid.requiresLogin, function(req, res, next) {
  var chapterId = req.body.chapterId;
  var priceBeforDiscount = req.body.priceBeforDiscount

  arr_update_dict = { "$set": {} }; 
  arr_update_dict["$set"]["priceBeforDiscount"] = priceBeforDiscount ;
  Chapter.findOneAndUpdate({_id: chapterId},arr_update_dict).then(function(){
    res.redirect('back')
  })
});
//////////////////////////////////////////////////////////////////////

//Get // edit_showInDiscountPanel
router.get('/edit_showInDiscountPanel/:chapterId/',mid.requiresAdmin, function(req, res){
  const {chapterId} = req.params;
  return res.render('admin/forms/edit_showInDiscountPanel', { title: 'here we are',chapterId:chapterId});
})

router.post('/edit_showInDiscountPanel', mid.requiresLogin, function(req, res, next) {
  var chapterId = req.body.chapterId;
  var showInDiscountPanel = req.body.showInDiscountPanel

  arr_update_dict = { "$set": {} }; 
  arr_update_dict["$set"]["showInDiscountPanel"] = showInDiscountPanel ;
  Chapter.findOneAndUpdate({_id: chapterId},arr_update_dict).then(function(){
    res.redirect('back')
  })
});
//////////////////////////////////////////////////////////////////////

//Get // edit_status
router.get('/edit_status/:chapterId/',mid.requiresAdmin, function(req, res){
  const {chapterId} = req.params;
  return res.render('admin/forms/edit_status', { title: 'here we are',chapterId:chapterId});
})

router.post('/edit_status', mid.requiresLogin, function(req, res, next) {
  var chapterId = req.body.chapterId;
  var status = req.body.status

  arr_update_dict = { "$set": {} }; 
  arr_update_dict["$set"]["status"] = status ;
  Chapter.findOneAndUpdate({_id: chapterId},arr_update_dict).then(function(){
    res.redirect('back')
  })
});
//////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////

//Get // editPrice
router.get('/editVendor/:chapterId/',mid.requiresAdmin, function(req, res){
  const {chapterId} = req.params;
  return res.render('admin/forms/editVendor', { title: 'here we are',chapterId:chapterId});
})

router.post('/editVendor', mid.requiresLogin, function(req, res, next) {
  var chapterId = req.body.chapterId;
  var vendor = req.body.vendor

  arr_update_dict = { "$set": {} }; 
  arr_update_dict["$set"]["vendor"] = vendor ;
  Chapter.findOneAndUpdate({_id: chapterId},arr_update_dict).then(function(){
    res.redirect('back')
  })
});



//Get // editCoureName
router.get('/editCoureName/:courseId/',mid.requiresAdmin, function(req, res){
  const {courseId} = req.params;
  return res.render('admin/forms/editCoureName', { title: 'here we are',courseId:courseId});
})

router.post('/editCoureName', mid.requiresLogin, function(req, res, next) {
  var courseId = req.body.courseId;
  var name = req.body.name

  arr_update_dict = { "$set": {} }; 
  arr_update_dict["$set"]["name"] = name ;
  Course.findOneAndUpdate({_id: courseId},arr_update_dict).then(function(){
    res.redirect('back')
  })
});

//Get // editChapterName
router.get('/editChapterName/:chapterId/',mid.requiresAdmin, function(req, res){
  const {chapterId} = req.params;
  return res.render('admin/forms/editChapterName', { title: 'here we are',chapterId:chapterId});
})

router.post('/editChapterName', mid.requiresLogin, function(req, res, next) {
  var chapterId = req.body.chapterId;
  var name = req.body.name

  arr_update_dict = { "$set": {} }; 
  arr_update_dict["$set"]["name"] = name ;
  Chapter.findOneAndUpdate({_id: chapterId},arr_update_dict).then(function(){
    res.redirect('back')
  })
});

//Get // deletChapter
router.get('/deletChapter/:chapterId/',mid.requiresAdmin, function(req, res){
  const {chapterId} = req.params;
  return res.render('admin/forms/deletChapter', { title: 'here we are',chapterId:chapterId});
})

router.post('/deletChapter', mid.requiresLogin, function(req, res, next) {
  var chapterId = req.body.chapterId;
  var name = req.body.name

  Chapter.deleteOne( {_id: chapterId} ).then(function(){
    res.redirect('back')
  })
});

//Get // ShowInHomePage
router.post('/ShowInHomePage/:courseId/',mid.requiresAdmin, function(req, res){
  const {courseId} = req.params;
  console.log("your reached ShowInHomePage node: "+ courseId)
  arr_update_dict = { "$set": {} }; 
  arr_update_dict["$set"]["showInHomePage"] = "yes" ;
  Course.findOneAndUpdate({_id: courseId},arr_update_dict).then(function(){
    res.redirect('back')
  })
})

//Get // HideFromHomePage
router.post('/HideFromHomePage/:courseId/',mid.requiresAdmin, function(req, res){
  const {courseId} = req.params;
  console.log("your reached HideFromHomePage node: "+ courseId)
  arr_update_dict = { "$set": {} }; 
  arr_update_dict["$set"]["showInHomePage"] = "no" ;
  Course.findOneAndUpdate({_id: courseId},arr_update_dict).then(function(){
    res.redirect('back')
  })
})

//Get // deleteCourse
router.get('/deleteCourse/:courseId/',mid.requiresAdmin, function(req, res){
  const {courseId} = req.params;
  return res.render('admin/forms/deleteCourse', { title: 'here we are',courseId:courseId});
})

router.post('/deleteCourse', mid.requiresLogin, function(req, res, next) {
  var courseId = req.body.courseId;
  var name = req.body.name

  Course.deleteOne( {_id: courseId} ).then(function(){
    try{
      Chapter.deleteMany( {"courseID": courseId} ).then(function(){
        res.redirect('course')
      })
    } catch (e){
      return next(e);
    }
  })
});



router.post('/AddLink', mid.requiresLogin, function(req, res, next) {
  var SectionIndex = req.body.SectionIndex;
  var chapterId = req.body.chapterId;
  var link = req.body.link

  arr_update_dict = { "$set": {} }; 
  arr_update_dict["$set"]["sectionsLinks."+SectionIndex] = link ;
  Chapter.findOneAndUpdate({_id: chapterId},arr_update_dict).then(function(){
    res.redirect('back')
  })
});

router.post('/renameSection', mid.requiresLogin, function(req, res, next) {
  var SectionIndex = req.body.SectionIndex;
  var chapterId = req.body.chapterId;
  var rename = req.body.rename

  arr_update_dict = { "$set": {} }; 
  arr_update_dict["$set"]["sections."+SectionIndex] = rename ;
  Chapter.findOneAndUpdate({_id: chapterId},arr_update_dict).then(function(){
    
    res.redirect('back')
  }).catch(function(error){
    return next(error);
  });
  
});

// Get  /EditChapter
router.get('/EditChapter/:id', mid.requiresAdmin, function(req, res, next) {
  const {order} = req.query;
  const {id} = req.params;

  Course.findById(id)
      .exec(function (error, result) {
        if (error) {
          return next(error);
        } else {
          return res.render('admin/EditChapter', { title: 'Profile',courseID:id,courseName: result.name,order: order, teacherId:  result.user});
        }
      });
});

// POST  /EditChapter
router.post('/EditChapter', mid.requiresLogin, function(req, res, next) {
  
  var chapterData = {
    'parent':req.body.parent,
    'name':req.body.chapterName,
    // 'sections': Array(1),
    'sectionsLinks': Array(0),
    'sectionsPrice': Array(1),
    // 'user': req.body.teacherId,
    'courseID': req.body.courseID,
    'courseName': req.body.courseName,
    'chapterName': req.body.chapterName,
    'description': req.body.description,
    'order': req.body.order,
    'price': 0,
    'priceBeforDiscount': 0,
    'status': "yes",
    'showInHomePage': "yes",
    'showInDiscountPanel': "no"
  };

  // // use schema's `create` method to insert document into Mongo
  Chapter.create(chapterData, function (error, result) {
    if (error) {
      return next(error);
    } else {
      var privates = path.join(__dirname, '../../public/products');
      var dir = privates +'/'+ result._id
      try{
        fs.mkdirSync(dir);
        console.log('directory created');
        return res.redirect(`course2/${req.body.courseID}`)
      } catch (err) {
        return next(err);
      }
    }
  });
  
})

// Get  /addChapter2
router.get('/addChapter2/:id', mid.requiresAdmin, function(req, res, next) {
  // const {side} = req.query;
  const {id} = req.params;
  Course.findById(id)
      .exec(function (error, result) {
        if (error) {
          return next(error);
        } else {
          return res.render('addChapter2', { title: 'Profile', data: result });
        }
      });
});

// Get  /My course
router.get('/course2/:id', mid.requiresLogin, function(req, res, next) {
  const {id} = req.params;
  Course.findOne({_id: id}).exec(function (error, courseData){
    if (error){
      return next(error);
    } else {
      var find = Chapter.find({courseID: id}).sort( { order: 1 } ).exec(function (error, ChaptersData){
        try {
          return res.render('admin/course2', { title: 'My Courses', courseData: courseData, ChaptersData:ChaptersData});
        } catch (e){
          return next(e);
        }
      })
    }
  });
});

// Get  /My course
router.get('/course',mid.requiresAdmin, function(req, res, next) {

  Course.find().exec(function (error, result){
    if (error){
      return next(error);
    } else {   
      return res.render('admin/course', { title: 'My Courses', data: result, length: result.length});
    }
  });
});

// GET  /AddCourse2
// router.get('/AddCourse2',mid.requiresAdmin, function(req, res, next) {
//   return res.render('admin/AddCourse2', { title: 'Add Course' });
// });

// GET / teacher
router.get('/AddCourse2',mid.requiresAdmin, function(req, res, next) {
  // POST /register
  // To Do >> make it fetch only for IDs
  Course.find().exec(function (error, courses){
    if (error){
      return next(error);
    } else {   
      return res.render('admin/AddCourse2', { title: 'Add Category', parents: courses});
    }
  });
  
});


// POST /AddCourse2
router.post('/AddCourse2', function(req, res, next) {


  var courseData = {
    'name':req.body.course,
    'parent':req.body.parent,
    'chapters': Array(1),
    'chaptersLinks': Array(1),  
    'user': req.body.teacherId,
    "subCategory": Array(1),
    // "subCategoryLinks": Array(1)
  };

  Course.create(courseData, function (error, theCourse) {
    if (error) {
      return next(error);
    } 
    else {
      var privates = path.join(__dirname, '../../privates');
      var dir = privates +'/'+ theCourse._id
      try{
        fs.mkdirSync(dir);
        console.log('directory created');
        if (req.body.parent == "0"){
          return res.redirect('course');
        } else {
          Course.findOneAndUpdate({_id: courseData.parent},
            {$push:
              {
                subCategory: theCourse._id,
              }
            }).then(function(){
              return res.redirect('course');
          }).catch(function(error){
            return next(error);
          });
        }
        
      } catch (err) {
        return next(err);
      }
    }
  })
})


// GET Add /Chapter // maybe to be delted
router.get('/AddChapter',mid.requiresAdmin, function(req, res, next) {
  return res.render('AddChapter', { title: 'Add Chapter' });
});



// GET /profile
router.get('/profile', mid.requiresAdmin, function(req, res, next) {
  User.findById(req.session.userId)
      .exec(function (error, user) {
        if (error) {
          return next(error);
        } else {
          return res.render('admin/profile', { title: 'Profile', name: user.name, favorite: user.favoriteBook });
        }
      });
});

// GET /logout
router.get('/logout',mid.requiresAdmin, function(req, res, next) {
  if (req.session) {
    // delete session object
    req.session.destroy(function(err) {
      if(err) {
        return next(err);
      } else {
        return res.redirect('../admin');
      }
    });
  }
});

// GET /login
router.get('/login', mid.loggedOut, function(req, res, next) {
  return res.render('admin/login', { title: 'Log In'});
});

// POST /login
router.post('/login', function(req, res, next) {
  if (req.body.email && req.body.password) {
    User.authenticate(req.body.email, req.body.password, function (error, user) {
      if (error || !user) {
        var err = new Error('Wrong email or password.');
        err.status = 401;
        return next(err);
      }  else {
        req.session.userId = user._id;
        req.session.email = user.email;
        return res.redirect('profile');
      }
    });
  } else {
    var err = new Error('Email and password are required.');
    err.status = 401;
    return next(err);
  }
});

// GET /
router.get('/',mid.requiresAdmin, function(req, res, next) {
  return res.render('admin/index', { title: 'Admin Home' });
});

// GET /reports
router.get('/reports',mid.requiresAdmin, function(req, res, next) {
  return res.render('admin/reports', { title: 'Reports' });
});

// GET /reports
router.post('/reports',mid.requiresAdmin, function(req, res, next) {

  const date = req.body.date
  var month = date.slice(0, 2)
  var nextMonth = parseInt(month)+1
  var year = date.slice(3)

  var dateFrom = new Date(`${month} 1 ${year} 00:00 UTC`);
  var dateTo = new Date(`${nextMonth} 1 ${year} 00:00 UTC`);

  // console.log(JSON.stringify(dateFrom))
  // console.log(JSON.stringify(dateTo))
 
  
  Charge.find({
    // teacherId: teacherData.teacherId,
    time: {
      $gte: dateFrom,
      $lt: dateTo
    }
  }).sort( { courseId: 1 } ).exec(function (error, theCharges){
    if (error){
      return next(error);
    } else {   
      console.log(theCharges)
      return res.render('admin/reports', { title: 'Reports', theCharges: theCharges});
    }
  });

  // return res.render('admin/reports', { title: 'Reports' });
});



router.get('/bills',mid.requiresAdmin, function(req, res, next) {

  const teacherData = {
    teacherId : req.query.teacherId,
    teacherName : req.query.teacherName
  }

  Teacher.find().exec(function (error, teachers){
    if (error){
      return next(error);
    } else {   
      return res.render('admin/bills', { title: 'Bills' , teachers: teachers, teacherData: teacherData});
    }
  });

  // return res.render('admin/bills', { title: 'Bills' , teacherData: teacherData});
});

router.post('/bills',mid.requiresAdmin, function(req, res, next) {


  const teacherData = {
    teacherName: req.body.teacherName,
    teacherId: req.body.teacherId,
    date: req.body.date,
  };
  // console.log(teacherData)

  var month = teacherData.date.slice(0, 2)
  var nextMonth = parseInt(month)+1
  var year = teacherData.date.slice(3)

  var dateFrom = new Date(`${month} 1 ${year} 00:00 UTC`);
  var dateTo = new Date(`${nextMonth} 1 ${year} 00:00 UTC`);

  // console.log(JSON.stringify(dateFrom))
  // console.log(JSON.stringify(dateTo))
 
  
  Charge.find({
    // teacherId: teacherData.teacherId,
    time: {
      $gte: dateFrom,
      $lt: dateTo
    }
  }).sort( { courseId: 1 } ).exec(function (error, theCharges){
    if (error){
      return next(error);
    } else {   
      console.log(theCharges)
      return res.render('admin/billsReport', { title: 'Bill', teacherData: teacherData, theCharges: theCharges});
    }
  });
});






// GET / teacher
router.get('/teacher',mid.requiresAdmin, function(req, res, next) {
  // POST /register
  Teacher.find().exec(function (error, teachers){
    if (error){
      return next(error);
    } else {   
      return res.render('admin/teacher', { title: 'Teachers', teachers: teachers, length: teachers.length});
    }
  });
});



router.post('/teacher', function(req, res, next) {
  console.log(req)
    if (req.body.email &&
      req.body.name &&
      req.body.password &&
      req.body.confirmPassword) {

        // confirm that user typed same password twice
        if (req.body.password !== req.body.confirmPassword) {
          var err = new Error('Passwords do not match.');
          err.status = 400;
          return next(err);
        }

        // create object with form input
        var teacherData = {
          email: req.body.email.toLowerCase(),
          name: req.body.name,
          password: req.body.password
        };

        // use schema's `create` method to insert document into Mongo
        Teacher.create(teacherData, function (error, user) {
          if (error) {
            console.log(error.code);
            if (error.code === 11000){
              // res.redirect('back')
              var err = new Error('Email already registered.');
              // err.status = 400;
              return next(err);
            }
            return next(error);
          } else {
            res.redirect('./teacher');
          }
        });

      } else {
        var err = new Error('All fields required.');
        err.status = 400;
        return next(err);
      }
  })
module.exports = router;
