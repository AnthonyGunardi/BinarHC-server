const { Mission_Gallery, Mission } = require('../models/index.js');
const fs = require('fs')
const path = require('node:path');
const { sendResponse, sendData } = require('../helpers/response.js');

class MissionGalleryController {
  static async create(req, res, next) {
    let uploadedFilePath = null; // Store file path in case of rollback

    try {
      const slug = req.params.slug;
      const { title } = req.body;

      // Check if mission slug exists
      const mission = await Mission.findOne({
        where: { slug }
      });
      if (!mission) {
        return sendResponse(404, "Mission is not found", res);
      }

      // Upload file if req.files exists
      let url = null;
      if (req.files) {
        const file = req.files.file;
        const fileSize = file.data.length;
        const ext = path.extname(file.name);
        const fileName = file.md5 + ext;
        const allowedType = ['.png', '.jpg', '.jpeg'];
        url = `mission-galleries/${fileName}`;
        uploadedFilePath = `./public/images/${url}`; // Store uploaded file path
  
        // Validate file type
        if (!allowedType.includes(ext.toLowerCase())) {
          return sendResponse(422, "File must be an image with extension png, jpg, jpeg", res);
        }  
        // Validate file size (max 5MB)
        if (fileSize > 5000000) {
          return sendResponse(422, "Image must be less than 5 MB", res);
        } 
        // Move file to the server
        await file.mv(uploadedFilePath);
      }

      const newGallery = await Mission_Gallery.create( { title, path: url, mission_id: mission.id } );
      sendData(201, { id: newGallery.id, title: newGallery.title }, "Success create mission gallery", res);  
    }
    catch (err) {
      // Delete old uploaded file if it exists
      if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
        await fs.promises.unlink(uploadedFilePath);
      }

      next(err)
    };
  };

  static async getGalleriesBySlug(req, res, next) {
    try {
      const slug = req.params.slug;

      //get mission_id
      const mission = await Mission.findOne({ 
        where: { slug } 
      });
      if (!mission) return sendResponse(404, 'Mission is not found', res);

      const galleries = await Mission_Gallery.findAll({
        where: { mission_id: mission.id },
        attributes: {
          exclude: ['mission_id']
        },
        order: [['title', 'asc']]
      });
      sendData(200, galleries, "Success get all mission galleries", res);
    } 
    catch (err) {
        next(err)
    };
  };

  static async getGallery(req, res, next) {
    const id = req.params.id;
    try {
      const gallery = await Mission_Gallery.findOne({
        where: { id },
        include: {
          model: Mission,
          attributes: {
            exclude: ['id']
          },
        }
      })
      if (!gallery) return sendResponse(404, "Mission gallery is not found", res)
      sendData(200, gallery, "Success get mission gallery", res)
    } 
    catch (err) {
      next(err)
    }
  }

  static async update(req, res, next) {
    let transaction;
    let uploadedFilePath = null; // Store file path in case of rollback

    try {
      transaction = await sequelize.transaction();
      const id = req.params.id
      const { title } = req.body;

      //check if mission gallery is exist
      const gallery = await Mission_Gallery.findOne({
        where: { id }
      })
      if (!gallery) return sendResponse(404, "Mission gallery is not found", res)

      //upload file if req.files isn't null
      let url = gallery.path;;
      if(req.files) {
        const file = req.files.file;
        const fileSize = file.data.length;
        const ext = path.extname(file.name);
        const fileName = file.md5 + ext;
        const allowedType = ['.png', '.jpg', '.jpeg'];
        url = `mission-galleries/${fileName}`;
        uploadedFilePath = `./public/images/${url}`; // Store uploaded file path
    
        //validate file type
        if(!allowedType.includes(ext.toLocaleLowerCase())) return sendResponse(422, "File must be image with extension png, jpg, jpeg", res)
        //validate file size max 5mb
        if(fileSize > 5000000) return sendResponse(422, "Image must be less than 5 mb", res)
        // Move file to the server
        await file.mv(uploadedFilePath);  
        // Delete previous file if exists
        if (gallery.path) {
          const filePath = `./public/images/${gallery.path}`;
          if (fs.existsSync(filePath)) {
            await fs.promises.unlink(filePath);
          }
        }
      }

      const updated = await Mission_Gallery.update(
        { title, path: url }, 
        { where: { id }, returning: true, transaction }
      )
      await transaction.commit();
      sendResponse(200, "Success update mission gallery", res)
    }
    catch (err) {
      // Rollback the transaction in case of an error
      if (transaction) await transaction.rollback();

      // Delete old uploaded file if it exists
      if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
        await fs.promises.unlink(uploadedFilePath);
      }

      next(err)
    }
  };

  static async delete(req, res, next) {
    const id = req.params.id
    try {
      //check if mission gallery is exist
      const gallery = await Mission_Gallery.findOne({
        where: { id }
      })
      if (!gallery) return sendResponse(404, "Mission gallery is not found", res)
      
      //delete previous file on server
      if (gallery.path !== null) {
        const filePath = `./public/images/${gallery.path}`;
        await fs.promises.unlink(filePath);
      }

      await Mission_Gallery.destroy({ where: { id } })
      sendResponse(200, "Success delete mission gallery", res)
    }
    catch (err) {
      if (err.code === 'ENOENT') {
        await Mission_Gallery.destroy({ where: { id } })
        sendResponse(200, "Success delete mission gallery", res)
      } else {
        next(err)
      }
    }
  }
};

module.exports = MissionGalleryController;