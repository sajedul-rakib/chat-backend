// const uploader = require("../../utilities/singleUploader");
const uploader = require("../../utilities/cloudinaryUploader");

function avatarUpload(req, res, next) {
  // const upload = uploader(
  //   ["image/jpeg", "image/jpg", "image/png"],
  //   1024 * 1024 * 5,
  //   "Only .jpg, jpeg or .png format allowed!"
  // );

  // call the middleware function
  uploader.any()(req, res, (err) => {
    if (err) {
      console.log(err);
      res.status(500).json({
        errors: {
          avatar: {
            msg: err.message,
          },
        },
      });
    } else {
      next();
    }
  });
}

module.exports = avatarUpload;
