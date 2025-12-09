const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// 1. Sajikan file HTML ketika seseorang membuka IP address laptop ini
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Variabel untuk menyimpan data kuis di RAM Server (Dapur)
// Data ini yang akan disebar ke semua HP santri
let activeQuizzes = {};

// 2. Saat ada HP/Laptop yang terkoneksi
io.on('connection', (socket) => {
    console.log('Ada perangkat terhubung:', socket.id);

    // A. Saat Santri/Ustadz baru buka, kirim data kuis terakhir
    socket.on('request-state', () => {
        socket.emit('sync-state', activeQuizzes);
    });

    // B. Saat Ustadz mengubah sesuatu (Buat kuis, Start kuis)
    // Server terima data baru -> Update RAM -> Kabari semua orang
    socket.on('update-state', (newState) => {
        activeQuizzes = newState;
        io.emit('sync-state', activeQuizzes); // Broadcast ke SEMUA orang
    });

    // C. Event Game (Santri menjawab, Ustadz next soal, dll)
    // Server jadi perantara: Terima sinyal -> Teruskan ke semua
    socket.on('quiz-event', (data) => {
        io.emit('quiz-event', data);
    });

    socket.on('disconnect', () => {
        console.log('Perangkat terputus:', socket.id);
    });
});

// 3. Jalankan Server di Port 3000
const PORT = 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log('--------------------------------------------------');
    console.log(`✅ SERVER BERJALAN SIAP DIGUNAKAN!`);
    console.log(`   Akses di Laptop ini: http://localhost:${PORT}`);
    console.log(`   Agar Santri bisa join, minta mereka akses IP Address Laptop ini.`);
    console.log(`   Contoh: http://192.168.1.X:${PORT}`);
    console.log('--------------------------------------------------');
});