const fs = require('fs');
const cloudinary = require('../utils/cloudinary');

const uploadImages = async (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ success: false, message: "No files uploaded" });
    }

    try {
        const uploadPromises = req.files.map((file) =>
            cloudinary.uploader.upload(file.path, {
                quality: "100",               // Full quality (no compression)
                fetch_format: "auto",         // Smart format (e.g., WebP)
                resource_type: "image",       // Ensure treated as image
                use_filename: true,
                unique_filename: false,
                overwrite: true
            }).then((result) => {
                fs.unlinkSync(file.path);    // Clean local file
                return result;
            })
        );

        const uploadResults = await Promise.all(uploadPromises);

        return res.status(200).json({
            success: true,
            message: "Images uploaded successfully in full quality!",
            data: uploadResults
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Error uploading images"
        });
    }
};

const uploadCarousel = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    try {
        const result = await cloudinary.uploader.upload(req.file.path, {
            quality: "100",               // Full quality (no compression)
            fetch_format: "auto",         // Smart format
            resource_type: "image",       // Force image type
            use_filename: true,
            unique_filename: false,
            overwrite: true
        });

        fs.unlinkSync(req.file.path);

        return res.status(200).json({
            success: true,
            message: "Image uploaded successfully in full quality!",
            data: result
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Error uploading image"
        });
    }
};

module.exports = { uploadImages, uploadCarousel };
