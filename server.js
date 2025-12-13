// server.js (Gemini API 서버)
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { GoogleGenAI } = require('@google/genai');

// .env 파일에서 환경 변수(API 키) 로드
dotenv.config();

const app = express();
const port = 3000; // 웹페이지가 접속할 서버 포트

// ⚠️ API 키를 .env 파일에서 가져옵니다. 
// 이 키가 노출되면 안 되기 때문에 server.js에 숨기는 겁니다.
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("오류: GEMINI_API_KEY 환경 변수를 찾을 수 없습니다.");
    console.log(".env 파일을 확인하고, 거기에 'GEMINI_API_KEY=YOUR_API_KEY' 형식으로 키를 입력했는지 확인하세요.");
    process.exit(1);
}

// Gemini AI 클라이언트 초기화
const ai = new GoogleGenAI({ apiKey });

// CORS 설정: 브라우저(localhost:포트번호)에서 이 서버(localhost:3000)로 요청을 보낼 수 있게 허용
app.use(cors());
app.use(express.json());

// 🌟 메인 API 엔드포인트: 랜덤 한글 성경 구절 요청
app.get('/api/random-verse', async (req, res) => {
    // Gemini에게 요청할 프롬프트(명령어)
    const prompt = `
        다음 JSON 형식으로 개역개정 성경에서 랜덤한 구절 하나를 찾아줘. 
        구절은 위로와 희망을 주는 말씀이면 좋겠어.
        반드시 JSON 형식만 출력해야 해. 
        
        {
          "text_korean": "여호와는 나의 목자시니 내게 부족함이 없으리로다.",
          "reference": "시편 23편 1절"
        }
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: {
                responseMimeType: 'application/json', // JSON 형식으로만 응답 요청
            }
        });

        // Gemini의 응답 텍스트를 JSON 객체로 파싱
        const responseText = response.text.trim();
        const verseData = JSON.parse(responseText);

        res.json(verseData);

    } catch (error) {
        console.error("Gemini API 호출 중 오류 발생:", error);
        res.status(500).json({ 
            error: "말씀을 불러오는 중 서버 오류 발생",
            text_korean: "오직 여호와를 앙망하는 자는 새 힘을 얻으리니 독수리가 날개 치며 올라감 같을 것이요",
            reference: "이사야 40장 31절 (오류)",
        });
    }
});


app.listen(port, () => {
    console.log(`✅ 성경 구절 서버가 http://localhost:${port} 에서 실행 중입니다.`);
    console.log(`⚠️ 이제 별도의 터미널을 열어 index.html 파일을 브라우저에서 실행하세요.`);
}); 
