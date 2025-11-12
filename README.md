# 📸 Instanza (Instagram Clone)

<div align="center">

![Instanza Logo](https://img.shields.io/badge/INSTANZA-Instagram%20Clone-pink?style=for-the-badge&logo=instagram)
![Version](https://img.shields.io/badge/version-2.0.0-blue?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)

**A full-stack Instagram-like social media platform with real-time features**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Installation](#-installation--setup) • [Screenshots](#-screenshots) • [Developer](#-developer)

</div>

---

## 🚀 Features

### 👤 Authentication & Users

- 🔐 **Secure JWT-based login & signup**
- 🗝️ **Password encryption** with bcrypt
- 📸 **Profile picture uploads** with Cloudinary
- 📧 **Email verification** & password reset
- 👨‍💼 **Role-based access** (User / Admin)
- ✅ **User verification** system

### 🏠 Posts & Feeds

- ➕ **Create, like, and comment** on posts
- ☁️ **Image uploads** using Cloudinary
- 👀 **Personalized feed** with followers' posts
- ⚡ **Real-time updates** using Socket.io
- 🗑️ **Delete posts** with confirmation

### 🎬 Reels

- 🎥 **Short-video feature** (like Instagram Reels)
- ❤️ **Like and comment** functionality
- ⏰ **Automatically sorted** by upload time
- 📱 **Mobile-optimized** video player

### 📖 Stories

- ⏳ **24-hour expiring stories**
- 🖼️ **Image or video stories** support
- 🎠 **Displayed in user carousel** format
- 👁️ **View count** tracking

### 💬 Encrypted Chat

- 🔒 **End-to-end encrypted messaging** using AES
- ⚡ **Real-time chat** powered by Socket.io
- 💾 **Conversation history** stored in MongoDB
- 👥 **Online status** tracking
- 🛡️ **Private and secure** communication

### 🔔 Notifications

- 🔴 **Real-time notifications** for:
  - ❤️ Likes
  - 💬 Comments
  - 👥 Follows
- 🚀 **Instant delivery** via WebSockets
- ✅ **Auto-read** after viewed

### 🛠️ Admin Dashboard

- 📊 **View all users, posts, and reels**
- 🗑️ **Delete or manage** user content
- 👑 **User role management**
- 📈 **Content moderation**

---

## 🧩 Tech Stack

### Frontend

- **React.js** — UI Framework
- **Axios** — HTTP Client
- **Socket.io Client** — Real-time communication
- **TailwindCSS** — Styling framework
- **Framer Motion** — Animations
- **React Icons** — Icon library
- **React Hot Toast** — Notifications

### Backend

- **Node.js** — Runtime environment
- **Express.js** — Web framework
- **Socket.io** — Real-time engine
- **Mongoose** — MongoDB ODM
- **JWT** — Authentication
- **bcryptjs** — Password hashing
- **Cloudinary** — File storage

### Database & Storage

- **MongoDB** — NoSQL database
- **Cloudinary** — Media storage & CDN

### Security

- **JWT** — Stateless authentication
- **CryptoJS** — Message encryption
- **bcrypt** — Password hashing
- **CORS** — Cross-origin resource sharing

---

## 📁 Project Structure

```bash
INstanza/
│
├── 📁 backend/
│   ├── 📁 config/
│   │   ├── keys.js
│   │   ├── dev.js
│   │   └── prod.js
│   ├── 📁 models/
│   │   ├── user.js
│   │   ├── post.js
│   │   ├── reel.js
│   │   ├── story.js
│   │   ├── conversation.js
│   │   ├── message.js
│   │   └── notification.js
│   ├── 📁 routes/
│   │   ├── auth.js
│   │   ├── post.js
│   │   ├── user.js
│   │   ├── reel.js
│   │   ├── story.js
│   │   ├── conversation.js
│   │   ├── message.js
│   │   ├── notification.js
│   │   └── upload.js
│   ├── 📁 middleware/
│   │   ├── requirelogin.js
│   │   └── errorHandler.js
│   ├── 📁 utils/
│   │   └── encryption.js
│   ├── app.js
│   ├── package.json
│   └── .env
│
├── 📁 frontend/
│   ├── 📁 public/
│   ├── 📁 src/
│   │   ├── 📁 components/
│   │   ├── 📁 pages/
│   │   ├── 📁 context/
│   │   ├── 📁 api/
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── .env
│
└── README.md
```

---

## ⚙️ Environment Configuration

### **Frontend Environment (`/frontend/.env`)**

```env
REACT_APP_BACKEND_URL=http://localhost:5000
REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
REACT_APP_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

### **Backend Environment (`/backend/.env`)**

```env
PORT=5000
MONGOURI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
ENCRYPTION_KEY=your_32_char_encryption_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
NODE_ENV=development
```

---

## 🧠 How It Works

### 🔐 Encrypted Messaging System

Messages are **AES-encrypted** before saving to the database:

```javascript
// Encryption
const encryptedText = CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();

// Decryption
const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY);
const decrypted = bytes.toString(CryptoJS.enc.Utf8);
```

This ensures **no plain text messages** are stored — privacy guaranteed 🔒

### ☁️ Cloudinary Media Upload

All media files are securely uploaded to Cloudinary:

```javascript
// Frontend upload
const data = new FormData();
data.append("file", image);
data.append("upload_preset", process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET);
data.append("cloud_name", process.env.REACT_APP_CLOUDINARY_CLOUD_NAME);
```

---

## 🖼️ Screenshots

Here’s a glimpse of **Instanza’s UI** ✨

### 🔐 Authentication Pages

|                                              **Sign In Page**                                              |                                              **Sign Up Page**                                              |
| :--------------------------------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------------------------------: |
| ![Signin Page](/images/sigin.png) | ![Signup Page](/images/signup.png) |

---

### 🏠 Home Feed

|                                             **Home Feed**                                              |                                               **User Profile**                                               |
| :----------------------------------------------------------------------------------------------------: | :----------------------------------------------------------------------------------------------------------: |
| ![Home Feed](/images/feed.png) | ![Profile Page](/images/user_profile.png) |

---

### 🎬 Reels 

|                                           **Reels Page**                                            
| :-------------------------------------------------------------------------------------------------: | 
| ![Reels](/images/reels.png) |

---

### 💬 Mobile View 

|                                            **Mobile View**                                          
| :----------------------------------------------------------------------------------------------------: | 
| ![Mobile View](/images/mobile_view.png) | 

---

### 👑 Admin Dashboard

|                                                   **Admin Dashboard**                                                   |
| :---------------------------------------------------------------------------------------------------------------------: |
| ![Admin Dashboard](/images/admin_dashboard.png) |

---



## 👨‍💻 Developer

**Developed by [Jiss James](https://github.com/jissjames322)**  
💬 _"Built with ❤️ using MERN Stack"_

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
