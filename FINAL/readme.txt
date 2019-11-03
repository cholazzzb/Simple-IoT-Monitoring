1. Deskripsi tentang tugas yang telah Anda buat (berhasil/tidak?, bug apa saja, apa yg unik/kelebihannya)
	a. Tugas yang kelompok kami buat berhasil (sesuai dengan konsep yang ingin dibuat dan sesuai standar yang diminta pada ketentuan tugas). Konsep kami adalah minimum possible configuration sehingga dibentuk seluruh sistem yang memenuhi standar yang diminta pada ketentuan tugas dengan asumsi digital input dari client dan dari edge-device secara fisik.
	b. Terdapat beberapa bug yang ditemukan selama pengerjaan:
	- Menjalankan node js (mosca) di windows memiliki bug sehingga terkadang harus stop mosquitto service dan menjalankan mosca kembali agar mengatur mqtt
	- Pada awalnya kelompok kami menggunakan protokol komunikasi dengan menggunakan 1 topic dan data terus menerus dikirimkan
	(bukan hanya saat ada perubahan). Hasilnya server, client, dan node terkadang "freeze" sehingga diubah ke protokol komunikasi dengan banyak topic dan data hanya dikirimkan ketika terjadi perubahan
	- Terdapat bug dari library plotly yang digunakan untuk visualisasi data real time, dibutuhkan koneksi internet untuk mengunduh dependency, dan setelah dependency diadakan secara offline juga terkadang terjadi error. Setelah diselidiki lebih lanjut, ternyata tipe data masukan dari plotly berbeda dengan yang dimiliki oleh variable pada client, masalah teratasi.
	c. Keunikan/Kelebihan dari tugas yang kami buat adalah:
	- Terdapat digital input secara fisik pada node yang dapat melakukan fungsi yang sama dengan button pada client serta diimplementasikan debouncing dengan kapasitor
	- Terdapat user experience berupa fade-in, design symmetry dan minimalis menggunakan bootstrap 4, penggunaan library plotly sebagai visualisasi data
	- Terdapat smoothing sinyal (data) dengan menggunakan moving average sesuai dengan rata-rata 5 menit terakhir
	- Terdapat dependency offline yang sebelumnya menggunakan CDN (plotly, mqtt paho, bootstrap, dkk), sehingga ketika jaringan tidak dapat terhubung dengan internet, Sistem tetap bekerja dengan baik.
	- Penggunaan mqtt paho sehingga struktur file lebih sederhana, ringan, dan mudah dimengerti apabila dibandingkan dengan mqtt.js
2. Daftar komponen-komponen elektronik yang digunakan pada rangkaian IOT Node:
	- 1x Wemos D1 Mini
	- 2x LED RGB 3-4V
	- 1x LED Putih 3-4V
	- 3x Capacitor 4.7uF
	- 4x Resistor 15k ohm
	- 3x Resistor 150 ohm
	- Kabel Jumper Male-Male
	- 1x Breadboard
	- 1x Kabel Micro USB Type-B
	- 1x LDR 10k ohm

3. Cara menjalankan kode-kodenya (IOT Server, IOT Client, IOT Node)
	1. Pastikan node, server, dan client sudah terkoneksi pada router yang sama, jika belum ubah code wemos untuk mengoneksikan pada router yang dituju dengan SSID dan password yang sesuai dan upload. Pastikan juga pada server dan client telah diinstall dependency sebagai berikut: mosca, npm, nodejs. *khusus windows, jika terdapat error mosquitto(mosca), pastikan install openSSL
	2. Lakukan pengecekkan ip address pada server-client dengan membuka command prompt dan menggunakan ipconfig (pada windows) atau ifconfig (pada linux), pastikan sudah sama dengan yang ada di dalam code wemos, jika belum, ubah ip address pada code wemos agar sesuai dan upload
	3. Buka melalui Command Prompt pada windows atau Terminal pada linux folder "TTS_TF40161_KEL1_13317014_13317041_13317043"
	4. Jalankan nodejs pada index.js dengan cara mengetik "node index.js" lalu tekan enter
	5. Nyalakan node dengan cara memasukkan node pada port USB, buka serial monitor, tunggu hingga terkoneksi
	6. Buka web browser, ketikkan "http://127.0.0.1:3000" lalu tekan enter
	7. Perhatikan sistem telah menyala dan siap digunakan

4. Nama anggota kelompok beserta kontribusi masing-masing dalam tugas ini:
	1. Fadhil (13317014) : IOT Client Front End
	2. Bernardus Rendy (13317041) : IOT Node (Software dan Hardware)
	3. Nicholas Biantoro (13317043) : IOT Client (Backend), IOT Server (Backend), dan Visualisasi Data IOT Client Front End