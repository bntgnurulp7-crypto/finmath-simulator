let myChart = null;

function formatRupiah(angka) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0
    }).format(angka);
}

function hitungSimulasi() {
    const target = parseFloat(document.getElementById('targetDana').value) || 0;
    const pv = parseFloat(document.getElementById('tabunganAwal').value) || 0;
    const pmt = parseFloat(document.getElementById('setoranRutin').value) || 0;
    const r_tahun = (parseFloat(document.getElementById('bungaTahunan').value) || 0) / 100;
    const tahun = parseInt(document.getElementById('jangkaWaktu').value) || 1;

    const r_bulan = r_tahun / 12;
    const totalBulan = tahun * 12;

    let saldoSaatIni = pv;
    let modalDisetor = pv;

    // Data untuk Grafik dan Tabel
    const labelTahun = ['Awal'];
    const dataSaldo = [pv];
    const dataModal = [pv];
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '';

    for (let bulan = 1; bulan <= totalBulan; bulan++) {
        // Rumus akumulasi bulanan (Anuitas di awal bulan)
        saldoSaatIni = (saldoSaatIni + pmt) * (1 + r_bulan);
        modalDisetor += pmt;

        // Catat setiap kelipatan 12 bulan (1 tahun)
        if (bulan % 12 === 0) {
            const tahunKe = bulan / 12;
            const akumulasiBunga = saldoSaatIni - modalDisetor;

            labelTahun.push(`Tahun ${tahunKe}`);
            dataSaldo.push(Math.round(saldoSaatIni));
            dataModal.push(Math.round(modalDisetor));

            // Tambahkan baris ke tabel
            const row = `
                <tr>
                    <td><b>${tahunKe}</b></td>
                    <td>${formatRupiah(modalDisetor)}</td>
                    <td style="color: #0f766e; font-weight: 600;">+${formatRupiah(akumulasiBunga)}</td>
                    <td><b>${formatRupiah(saldoSaatIni)}</b></td>
                </tr>
            `;
            tableBody.innerHTML += row;
        }
    }

    const totalBungaAkhir = saldoSaatIni - modalDisetor;

    // Update Kartu Ringkasan
    document.getElementById('resTotalUang').innerText = formatRupiah(saldoSaatIni);
    document.getElementById('resTotalBunga').innerText = formatRupiah(totalBungaAkhir);
    document.getElementById('resTotalModal').innerText = formatRupiah(modalDisetor);

    // Update Banner Status Target
    const statusBanner = document.getElementById('statusBanner');
    const selisih = saldoSaatIni - target;

    if (saldoSaatIni >= target) {
        statusBanner.className = 'status-banner status-success';
        statusBanner.innerHTML = `✅ <b>Target Tercapai!</b> Dana Anda melampaui target sebesar <b>${formatRupiah(selisih)}</b> dalam ${tahun} tahun.`;
    } else {
        statusBanner.className = 'status-banner status-warning';
        statusBanner.innerHTML = `⚠️ <b>Belum Mencapai Target.</b> Anda masih membutuhkan tambahan <b>${formatRupiah(Math.abs(selisih))}</b> lagi untuk mencapai target.`;
    }

    // Render / Update Grafik
    renderChart(labelTahun, dataSaldo, dataModal);
}

function renderChart(labels, saldoData, modalData) {
    const ctx = document.getElementById('growthChart').getContext('2d');

    if (myChart) {
        myChart.destroy();
    }

    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Total Saldo (+ Bunga Majemuk)',
                    data: saldoData,
                    borderColor: '#0f766e',
                    backgroundColor: 'rgba(15, 118, 110, 0.12)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.3
                },
                {
                    label: 'Total Modal Disetor Murni',
                    data: modalData,
                    borderColor: '#94a3b8',
                    borderDash: [5, 5],
                    borderWidth: 2,
                    fill: false,
                    tension: 0.3
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + formatRupiah(context.raw);
                        }
                    }
                }
            },
            scales: {
                y: {
                    ticks: {
                        callback: function(value) {
                            return 'Rp ' + (value / 1000000).toFixed(0) + ' Jt';
                        }
                    }
                }
            }
        }
    });
}

function toggleModal() {
    const modal = document.getElementById('mathModal');
    modal.style.display = modal.style.display === 'block' ? 'none' : 'block';
}

// Jalankan otomatis saat halaman pertama kali dibuka
window.onload = hitungSimulasi;