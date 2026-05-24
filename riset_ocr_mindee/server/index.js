import express from 'express';
import multer from 'multer';
import cors from 'cors';
import { Client, product } from 'mindee';
import 'dotenv/config';

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());

const mindeeClient = new Client({ apiKey: process.env.MINDEE_API_KEY });

app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).send('No file uploaded.');

    // Berdasarkan log terminal kamu, metodenya ada di dalam mindeeApi
    const inputSource = mindeeClient.mindeeApi.docFromPath(req.file.path);
    
    // Proses parsing tetap menggunakan client utama
    const apiResponse = await mindeeClient.parse(product.ReceiptV5, inputSource);
    
    const prediction = apiResponse.document.inference.prediction;
    
    res.json({
      merchant: prediction.supplierName.value || "Tidak terdeteksi",
      total: prediction.totalAmount.value || 0,
      date: prediction.date.value || "Tidak terdeteksi",
      status: "Success"
    });
  } catch (error) {
    console.error("Detail Error:", error);
    res.status(500).json({ 
      error: "Gagal memproses struk", 
      message: error.message 
    });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server jalan di port ${PORT}`));