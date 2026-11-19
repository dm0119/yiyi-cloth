const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const sharp = require('sharp')
const { authenticateToken } = require('../utils/authMiddleware')

const router = express.Router()
const config = require('../config')

// 上传接口不需要认证（用于商家入驻等场景）
// router.use(authenticateToken)

const uploadDir = path.join(__dirname, '../uploads')

// 确保上传目录存在
if (!fs.existsSync(uploadDir)) {
  try {
    fs.mkdirSync(uploadDir, { recursive: true })
    console.log('上传目录创建成功:', uploadDir)
  } catch (error) {
    console.error('创建上传目录失败:', error)
  }
}

const uploadStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const ext = path.extname(file.originalname)
    // 根据请求路径判断文件类型
    const isProductUpload = req.originalUrl.includes('/upload/product')
    const isReviewUpload = req.originalUrl.includes('/upload/review')
    let prefix = 'discussion_'
    if (isProductUpload) {
      prefix = 'product_'
    } else if (isReviewUpload) {
      prefix = 'review-'
    }
    cb(null, prefix + uniqueSuffix + ext)
  }
})

// 图片压缩配置
const compressImage = async (file) => {
  const filePath = file.path
  const ext = path.extname(file.originalname).toLowerCase()
  
  // 如果是 PNG 文件，转换为 WebP 格式以减小体积
  if (ext === '.png' || ext === '.jpg' || ext === '.jpeg' || ext === '.webp') {
    const outputPath = filePath.replace(ext, '.webp')
    
    try {
      await sharp(filePath)
        .resize(1200, 1200, { // 限制最大尺寸
          fit: 'inside',
          withoutEnlargement: true
        })
        .webp({ 
          quality: 80, // 80% 质量，平衡清晰度和文件大小
          effort: 4 // 压缩效率，1-6，数字越大压缩越好但越慢
        })
        .toFile(outputPath)
      
      // 删除原文件
      fs.unlinkSync(filePath)
      
      return {
        path: outputPath,
        filename: path.basename(outputPath),
        originalname: file.originalname.replace(ext, '.webp'),
        size: fs.statSync(outputPath).size
      }
    } catch (error) {
      console.error('图片压缩失败，使用原文件:', error.message)
      // 如果压缩失败，返回原文件
      return file
    }
  }
  
  return file
}

const uploadMiddleware = multer({
  storage: uploadStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)
    
    if (mimetype && extname) {
      return cb(null, true)
    } else {
      cb(new Error('只支持图片格式：jpeg, jpg, png, gif, webp'))
    }
  }
})

// 处理单张图片上传（支持 file 字段，用于实名认证等场景）
router.post('/single', uploadMiddleware.single('file'), async (req, res) => {
  try {
    console.log('收到单张图片上传请求:', req.file)
    if (!req.file) {
      return res.status(400).json({ success: false, message: '请选择要上传的图片' })
    }
    
    // 压缩图片
    const compressedFile = await compressImage(req.file)
    console.log('图片处理完成:', compressedFile.filename, '大小:', (compressedFile.size / 1024).toFixed(2) + 'KB')
    
    const fileUrl = `http://localhost:${config.server.port}/uploads/${compressedFile.filename}`
    console.log('文件上传成功:', fileUrl)
    
    res.json({
      success: true,
      data: {
        url: fileUrl,
        path: fileUrl
      },
      message: `上传成功，已优化图片大小：${(compressedFile.size / 1024).toFixed(2)}KB`
    })
  } catch (error) {
    console.error('单张图片上传失败:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// 处理通用图片上传（支持 file 字段，用于商家入驻等场景）
router.post('/', uploadMiddleware.single('file'), async (req, res) => {
  try {
    console.log('收到通用图片上传请求:', req.file)
    if (!req.file) {
      return res.status(400).json({ success: false, message: '请选择要上传的图片' })
    }
    
    // 压缩图片
    const compressedFile = await compressImage(req.file)
    console.log('图片处理完成:', compressedFile.filename, '大小:', (compressedFile.size / 1024).toFixed(2) + 'KB')
    
    const fileUrl = `http://localhost:${config.server.port}/uploads/${compressedFile.filename}`
    console.log('文件上传成功:', fileUrl)
    
    res.json({
      success: true,
      url: fileUrl,
      message: `上传成功，已优化图片大小：${(compressedFile.size / 1024).toFixed(2)}KB`
    })
  } catch (error) {
    console.error('通用图片上传失败:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// 处理商品图片上传（支持 file 字段）
router.post('/product', uploadMiddleware.single('file'), async (req, res) => {
  try {
    console.log('收到商品图片上传请求:', req.file)
    if (!req.file) {
      return res.status(400).json({ success: false, message: '请选择要上传的图片' })
    }
    
    // 压缩图片
    const compressedFile = await compressImage(req.file)
    console.log('图片处理完成:', compressedFile.filename, '大小:', (compressedFile.size / 1024).toFixed(2) + 'KB')
    
    const fileUrl = `http://localhost:${config.server.port}/uploads/${compressedFile.filename}`
    console.log('文件上传成功:', fileUrl)
    
    res.json({
      success: true,
      data: { url: fileUrl },
      message: `上传成功，已优化图片大小：${(compressedFile.size / 1024).toFixed(2)}KB`
    })
  } catch (error) {
    console.error('商品图片上传失败:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// 处理评价图片上传（支持单个文件上传）
router.post('/review', uploadMiddleware.single('images'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: '请选择要上传的图片' })
    }
    
    // 压缩图片
    const compressedFile = await compressImage(req.file)
    console.log('评价图片处理完成:', compressedFile.filename, '大小:', (compressedFile.size / 1024).toFixed(2) + 'KB')
    
    const fileUrl = `http://localhost:${config.server.port}/uploads/${compressedFile.filename}`
    
    res.json({
      success: true,
      data: [fileUrl],
      message: `上传成功，已优化图片大小：${(compressedFile.size / 1024).toFixed(2)}KB`
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

module.exports = router
