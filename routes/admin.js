var express = require("express");
var router = express.Router();

const connection = require("../config/database");
var RunQuery = connection.RunQuery;

function isAdmin(req, res, next) {
  if (req.isAuthenticated()) {
    if (req.user.Admin == 1) {
      return next();
    } else {
      res.redirect("/usr/" + req.user.Username);
    }
  }
  res.redirect("/");
}
router.all("/", isAdmin, (req, res) => {
  let sqlStr = "SELECT * FROM Products";

  RunQuery(sqlStr, function (product) {
    res.render("admin/adminapp", {
      title: "Shopee 2.0",
      product: product,
    });
  });
});

router.get("/add_product", isAdmin, (req, res) => {
  res.render("admin/form/add_product_form", {
    title: "Shopee 2.0",
  });
});

router.post("/save_product", isAdmin, (req, res) => {
  let data = {
    ProductName: req.body.ProductName,
    CategoryID: req.body.CategoryID,
    ProductPrice: req.body.ProductPrice,
    UnitsInStock: req.body.UnitsInStock,
    Description: req.body.Description,
    ManufactureYear: req.body.ManufactureYear,
    Image: req.body.Image,
    ProductSlug: req.body.ProductSlug,
    Feature: req.body.Feature,
    Banner_event: req.body.Banner_event,
  };

  let sql = "INSERT INTO Products SET ?";
  RunQuery(sql, data, (err, results) => {
    if (err) throw err;
    res.redirect("/");
  });
});

router.get("/edit/:ProductSlug", isAdmin, (req, res) => {
  const ProductSlug = req.params.ProductSlug;
  let sql = `SELECT * FROM Products WHERE ProductSlug = '${ProductSlug}'`;
  RunQuery(sql, function (result) {
    res.render("admin/form/update_form", {
      title: "Shopee 2.0",
      product: result[0],
    });
  });
});

router.post("/update", isAdmin, (req, res) => {
  const ProductSlug = req.body.ProductSlug;
  let sql =
    "UPDATE Products SET ProductName='" +
    req.body.ProductName +
    "',  ProductPrice='" +
    req.body.ProductPrice +
    "', Image='" +
    req.body.Image +
    "', Description='" +
    req.body.Description +
    "',UnitsInStock='" +
    req.body.UnitsInStock +
    "', ManufactureYear='" +
    req.body.ManufactureYear +
    "' WHERE ProductSlug =" +
    `'${ProductSlug}'`;
  RunQuery(sql, function () {
    if (err) throw err;
    res.redirect("/");
  });
});

router.get("/delete/:ProductSlug", isAdmin, (req, res) => {
  const ProductSlug = req.params.ProductSlug;
  let sql = `DELETE from Products WHERE ProductSlug = '${ProductSlug}'`;
  RunQuery(sql, (err, result) => {
    if (err) throw err;
    res.redirect("/");
  });
});

// api router
router.get("/api/product", isAdmin, (req, res) => {
  let sqlStr = `SELECT * FROM Products`;
  RunQuery(sqlStr, function (product) {
    res.json(product);
  });
});
// router.get("/api/product/:UnitsInStock", (req, res) => {
//   let UnitsInStock = req.params.UnitsInStock;
//   let sqlStr = `SELECT * FROM Products WHERE UnitsInStock > ${UnitsInStock}`;
//   RunQuery(sqlStr, function (product) {
//     res.json(product);
//   });
// });

var fs = require("fs");
router.post("/api/product/post", isAdmin, (req, res) => {
  let UnitsInStock = req.body.UnitsInStock;
  let sqlStr = `SELECT * FROM Products WHERE UnitsInStock > ${UnitsInStock}`;
  RunQuery(sqlStr, function (product) {
    var data = JSON.stringify(product, null, 2);
    fs.writeFile("data/UnitStock.json", data, finished);
    function finished(err) {
      console.log("all set");
    }
    res.redirect("/admin/chart");
  });
});

//api tạo trang
router.get("/chart", (req, res) => {
  res.render("admin/Chart/StockChart", {
    title: "Shopee 2.0",
  });
});

//REPORT GET ALL USER
// /report/users duong dan
router.get("/report/users", isAdmin, function (req, res, next) {
  //in here we have 3 variable req,res is need next not need or need
  //req mean request, res mean resquest or can say input or ouput from user
  var sqlStr = "SELECT * FROM Users";
  //sql query
  RunQuery(sqlStr, function (UserReport) {
    //function run that sql query and put it in Variable UserReport
      var contextDict = {
        //contextDict is variable recivese all element
        title: "User Report",
        //title
        user: UserReport,
        // call new public variable to then render it in file UserReport.ejs
        customer: req.user,
        //this one define becasue it need login user above i user IsAdmin that is function to identify the admin
      };
      res.render("admin/Report/UserReport", contextDict);
      //res.render is where is use the file, call back contextDict.
  });
});
///////////////////////////////////////////////////////

router.get("/report/userinfor", (req, res) => {
  var mysql = "SELECT * FROM Users";
    RunQuery(mysql, function(UserInfor) {
        var content = {
          title: "user",
          usr: UserInfor,
          customer: req.user
        };
        res.render("admin/Report/userinfor", content);
    });
});

// router.get("/chart", (req, res) => {
//   res.render("admin/chart/lineChart", {
//     title: "Shopee 2.0",
//   });
// });

// router.post('/uploadimg', (req, res) => {
//     let sampleFile;
//     let uploadPath;

//     if (!req.files)
//     return res.status(400).send('No files were uploaded.');

//     sampleFile = req.files.sampleFile;
//     uploadPath = __dirname + '/upload/' + sampleFile.name;

//     console.log(sampleFile);
//     sampleFile.mv(uploadPath, function (err) {
//         if (err) return res.status(500).send(err);

//         connection.query('UPDATE Product SET img = ? WHERE id = "10"', [sampleFile.name], (err, rows) => {
//             if (!err) {
//                 console.log('sucess')
//             } else {
//                 console.log(err);
//             }
//         });

//     });
// });

module.exports = router;
