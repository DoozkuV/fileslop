# Fileslop

A modern, feature-rich browser-based file manager built with React, TypeScript, and the File System Access API. Fileslop provides a native file manager experience directly in your browser with support for advanced file operations, drag-and-drop, bookmarks, and more.

## ✨ Features

### Core Functionality
- 📁 **Browse Files & Folders** - Navigate your file system with ease
- 🔍 **Search** - Find files and folders quickly
- 📋 **File Operations** - Copy, cut, paste, delete, and rename files
- 🗂️ **Create New Items** - Create new files and folders
- 👁️ **File Preview** - Open files in appropriate applications

### Advanced Features
- 🖱️ **Drag & Drop Support** - Move files by dragging them between folders
- 🔖 **Bookmarks** - Save frequently used directories for quick access
- 🖼️ **Image Thumbnails** - Preview images directly in the file list
- 🎯 **Context Menus** - Right-click for quick actions
- ⌨️ **Keyboard Shortcuts** - Efficient navigation and operations
- 🔄 **History Navigation** - Go back and forward through your browsing history

### Views & Interface
- 📊 **Multiple View Modes** - Switch between list and grid views
- 🎨 **Modern UI** - Clean, responsive design that works on all devices
- 🌙 **Professional Theme** - Easy on the eyes with proper contrast
- 📱 **Mobile Friendly** - Fully responsive for mobile and tablet use

## 🚀 Getting Started

### Prerequisites

- **Node.js** (version 16 or higher)
- **npm** or **yarn**
- **Modern Browser** - Chrome/Edge 86+ (for File System Access API support)

### Installation

1. **Clone or download** this repository
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Start the development server**:
   ```bash
   npm run dev
   ```
4. **Open your browser** and navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory and can be served by any static file server.

## 🖥️ Browser Compatibility

Fileslop uses the **File System Access API**, which provides direct access to the user's file system. Browser support:

- ✅ **Chrome 86+** - Full support
- ✅ **Edge 86+** - Full support  
- ⚠️ **Firefox** - Limited support (will show compatibility warning)
- ⚠️ **Safari** - Limited support (will show compatibility warning)

### Fallback Behavior

For browsers without File System Access API support, Fileslop will:
- Display a compatibility warning
- Allow file upload/download operations
- Provide limited file management capabilities

## 📖 How to Use

### Getting Started
1. **Grant Permission**: Click "Choose Folder" to select a directory to explore
2. **Navigate**: Double-click folders to enter them, use the back/forward buttons, or click bookmarks
3. **Select Files**: Click to select single files, Ctrl+click for multiple selection
4. **Perform Actions**: Right-click for context menu, or use keyboard shortcuts

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+A` | Select all items |
| `Ctrl+C` | Copy selected items |
| `Ctrl+X` | Cut selected items |
| `Ctrl+V` | Paste clipboard items |
| `Delete` | Delete selected items |
| `F2` | Rename selected item |
| `F5` | Refresh current directory |
| `Escape` | Clear selection / Close dialogs |
| `Ctrl+Shift+N` | Create new folder |
| `Ctrl+Alt+N` | Create new file |
| `Enter` | Open selected item |

### File Operations

#### Copy & Paste
1. Select files/folders
2. Right-click and choose "Copy" or press `Ctrl+C`
3. Navigate to destination folder
4. Right-click and choose "Paste" or press `Ctrl+V`

#### Cut & Move
1. Select files/folders
2. Right-click and choose "Cut" or press `Ctrl+X`
3. Navigate to destination folder
4. Right-click and choose "Paste" or press `Ctrl+V`

#### Drag & Drop
- Drag files/folders directly onto target folders
- Visual feedback shows valid drop targets
- Works in both list and grid views

#### Bookmarks
- Click the star icon in the sidebar to bookmark the current folder
- Click on bookmarks to navigate quickly
- Remove bookmarks by clicking the trash icon

## 🛠️ Development

### Project Structure

```
src/
├── components/          # React components
│   ├── FileItem.tsx     # Individual file/folder item
│   ├── FileList.tsx     # File list container
│   ├── Toolbar.tsx      # Top navigation toolbar
│   ├── Sidebar.tsx      # Left sidebar with bookmarks
│   ├── ContextMenu.tsx  # Right-click context menu
│   └── ...
├── hooks/               # Custom React hooks
│   ├── useFileSystem.ts # File system state management
│   └── useDragDrop.ts   # Drag and drop functionality
├── types/               # TypeScript type definitions
├── utils/               # Utility functions and API wrappers
│   ├── fileSystemAPI.ts # File System Access API wrapper
│   └── fileUtils.ts     # File utility functions
└── App.tsx              # Main application component
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

### Technologies Used

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Lucide React** - Icons
- **File System Access API** - Native file system access
- **CSS Variables** - Theming and styling

## 🔒 Security & Privacy

- **Local Only**: All operations happen locally on your machine
- **No Data Collection**: No data is sent to external servers
- **Permission Based**: Only accesses folders you explicitly grant permission to
- **Sandboxed**: Uses browser security model to protect your system

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and test thoroughly
4. Commit your changes: `git commit -am 'Add some feature'`
5. Push to the branch: `git push origin feature-name`
6. Submit a pull request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🐛 Known Issues & Limitations

- **Browser Support**: Limited to Chromium-based browsers for full functionality
- **File Size**: Very large files may cause performance issues
- **Permissions**: Some system directories may be inaccessible due to browser security
- **Mobile**: Touch interactions may be limited on some mobile devices

## 💡 Future Enhancements

- File compression/decompression
- Advanced search with filters
- Multiple tab support  
- File preview for more file types
- Theme customization
- Cloud storage integration
- File sharing capabilities

---

**Built with ❤️ using modern web technologies**