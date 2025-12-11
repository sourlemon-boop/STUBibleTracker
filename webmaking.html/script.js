// script.js 파일 - 완전히 새로 작성됨

// ==========================================================
// 0. 전역 변수 설정 및 데이터 정의
// ==========================================================
const BIBLE_BOOKS = {
    "창세기": 50, "출애굽기": 40, "레위기": 27, "민수기": 36, "신명기": 34,
    "여호수아": 24, "사사기": 21, "룻기": 4, "사무엘상": 31, "사무엘하": 24,
    "열왕기상": 22, "열왕기하": 25, "역대상": 29, "역대하": 36, "에스라": 10,
    "느헤미야": 13, "에스더": 10, "욥기": 42, "시편": 150, "잠언": 31,
    "전도서": 12, "아가": 8, "이사야": 66, "예레미야": 52, "예레미야애가": 5,
    "에스겔": 48, "다니엘": 12, "호세아": 14, "요엘": 3, "아모스": 9,
    "오바댜": 1, "요나": 4, "미가": 7, "나훔": 3, "하박국": 3,
    "스바냐": 3, "학개": 2, "스가랴": 14, "말라기": 4, 
    "마태복음": 28, "마가복음": 16, "누가복음": 24, "요한복음": 21,
    "사도행전": 28, "로마서": 16, "고린도전서": 16, "고린도후서": 13,
    "갈라디아서": 6, "에베소서": 6, "빌립보서": 4, "골로새서": 4,
    "데살로니가전서": 5, "데살로니가후서": 3, "디모데전서": 6, "디모데후서": 4,
    "디도서": 3, "빌레몬서": 1, "히브리서": 13, "야고보서": 5,
    "베드로전서": 5, "베드로후서": 3, "요한일서": 5, "요한이서": 1,
    "요한삼서": 1, "유다서": 1, "요한계시록": 22
};

let totalChapters = 0;
for (const book in BIBLE_BOOKS) {
    totalChapters += BIBLE_BOOKS[book];
}

let currentUserName = null;
let readingRecords = {};
let recordKey = null;

// ==========================================================
// 1. 로그인/로그아웃 처리 로직
// ==========================================================

function loginSuccess(userName) {
    currentUserName = userName;
    recordKey = `bibleRecords_${userName}`;
    // 사용자에 맞는 기록 불러오기
    readingRecords = JSON.parse(localStorage.getItem(recordKey)) || {};

    // 화면 전환: 로그인 폼 숨기고 사용자 정보/로그아웃 버튼 표시
    document.getElementById('login-form-area').style.display = 'none';
    document.getElementById('user-info-area').style.display = 'block';

    // 타이틀 및 정보 업데이트
    document.getElementById('panel-title').textContent = "기록 확인";
    document.getElementById('app-title').textContent = `📖 ${userName}님의 통독 트래커`;
    document.getElementById('logged-in-user').textContent = userName;
    
    // 핵심 앱 기능 실행
    startTrackerApp(); 
}

// 💡 로그아웃 함수: 네가 코드를 안 줬지만, 정상적인 로그아웃 기능을 위해 추가했어.
function logoutUser() {
    currentUserName = null;
    readingRecords = {};
    localStorage.removeItem('userName'); 

    // 화면 전환: 사용자 정보 숨기고 로그인 폼 표시
    document.getElementById('login-form-area').style.display = 'block';
    document.getElementById('user-info-area').style.display = 'none';
    document.getElementById('panel-title').textContent = "기록 시작";
    document.getElementById('app-title').textContent = `📖 성경 통독 트래커`;
    document.getElementById('username').value = '';

    // 화면 초기화 (체크리스트, 통계 초기화)
    document.getElementById('bible-list').innerHTML = '<p>로그인 후 목록을 불러올 수 있습니다.</p>';
    document.getElementById('progress-text').textContent = `현재 0장 / ${totalChapters}장 (0%) 통독`;
    document.getElementById('progress-bar').style.width = '0%';
}
// [script.js] 파일 - setupLoginLogic 함수 전체를 아래 코드로 교체

function setupLoginLogic() {
    const loginButton = document.getElementById('login-button');
    const logoutButton = document.getElementById('logout-button');
    const usernameInput = document.getElementById('username');
    const messageElement = document.getElementById('login-message');

    // 로그인 버튼 클릭 이벤트
    loginButton.addEventListener('click', () => {
        const enteredName = usernameInput.value.trim();
        
        // 이름 유효성 검사 강화
        if (enteredName.length < 2) {
            messageElement.textContent = "이름을 두 글자 이상 입력해 주세요.";
            usernameInput.value = ''; 
            return;
        }
        
        // 이름이 정상적일 때만 저장 및 로그인
        localStorage.setItem('userName', enteredName); 
        messageElement.textContent = '';
        loginSuccess(enteredName);
    });

    // 로그아웃 버튼 클릭 이벤트
    logoutButton.addEventListener('click', logoutUser);
    
    // 엔터 키 입력 처리
    usernameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            loginButton.click();
        }
    });

    // 🌟🌟🌟 수정된 로직: 앱 로드 시 자동 로그인 방지 🌟🌟🌟
    const storedUser = localStorage.getItem('userName');
    
    // 1. 항상 로그아웃 상태로 초기화하여 '기록 시작' 화면을 보여줍니다.
    logoutUser(); 
    
    // 2. 이전에 로그인했던 이름이 있다면, 입력 필드에만 채워 넣어 편리하게 로그인할 수 있도록 돕습니다.
    if (storedUser) {
        usernameInput.value = storedUser;
    }
}

// ==========================================================
// 2. 핵심 앱 기능 (로그인 후 실행됨)
// ==========================================================

function startTrackerApp() {
    // 로그인 성공 후 실행되는 함수
    fetchDailyVerse();
    renderBibleList(); // 💡 여기서 체크 목록이 화면에 나타남!
    updateProgress();
}

function fetchDailyVerse() {
    // (이전에 랜덤 구절 선택 로직으로 수정했다고 가정하고, 코드는 생략)
    // 현재 코드에는 랜덤 구절 로직이 없어서 요한복음 3장 16절로 고정되어 있음.
    const apiUrl = 'https://bible-api.com/john%203:16'; 
    const verseElement = document.getElementById('daily-verse');
    
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) throw new Error(`API 호출 실패! 상태 코드: ${response.status}`);
            return response.json();
        })
        .then(data => {
            const reference = data.reference; 
            const text = data.text.trim(); 
            verseElement.innerHTML = `<p class="verse-text">"${text}"</p><footer>— **${reference}** (${data.translation_name})</footer>`;
        })
        .catch(error => {
            console.error('API 호출 중 오류 발생:', error);
            verseElement.innerHTML = "말씀을 불러오지 못했습니다. 네트워크를 확인해 주세요. 😢";
        });
}

// [script.js] 파일에서 updateProgress 함수를 교체

function updateProgress() {
    let completedChapters = 0;
    
    for (const book in readingRecords) {
        for (const chapter in readingRecords[book]) {
            if (readingRecords[book][chapter] === true) {
                completedChapters++;
            }
        }
    }

    const percentage = ((completedChapters / totalChapters) * 100); // toFixed(2) 제거
    
    // 💡 화면 업데이트
    document.getElementById('progress-bar').style.width = percentage.toFixed(2) + '%';
    document.getElementById('progress-text').textContent = 
        `현재 ${completedChapters}장 / ${totalChapters}장 (${percentage.toFixed(2)}%) 통독`;

    // 🌟 100% 달성 체크 로직 추가
    const congratsArea = document.getElementById('congratulations-area');

    if (percentage >= 100) {
        congratsArea.style.display = 'block';
        launchConfetti(100); // 폭죽 100개 발사!
    } else {
        congratsArea.style.display = 'none';
    }
}
function handleCheckboxChange(event) {
    const checkbox = event.target;
    const [bookName, chapterNum] = checkbox.value.split('-');
    
    if (!readingRecords[bookName]) {
        readingRecords[bookName] = {};
    }
    
    readingRecords[bookName][chapterNum] = checkbox.checked;
    
    localStorage.setItem(recordKey, JSON.stringify(readingRecords));
    
    updateProgress();
}

function renderBibleList() {
    const listContainer = document.getElementById('bible-list');
    
    // 💡 HTML에 'bible-list'라는 ID를 가진 요소가 없는 것 같아! 
    // HTML을 봤을 때 <div id="bible-list">가 없어서 이 코드가 에러를 낼 수 있음.
    // HTML에 <div id="bible-list">를 추가해야 하지만, 일단 목록이 나오도록 진행.
    if (!listContainer) {
        console.error("오류: HTML에 'bible-list' ID를 가진 요소가 없습니다!");
        // 목록이 안 나오면 이 에러가 원인일 수도 있어.
        return; 
    }
    
    listContainer.innerHTML = '';

    for (const book in BIBLE_BOOKS) {
        const totalChaptersInBook = BIBLE_BOOKS[book];
        
        const bookDiv = document.createElement('div');
        bookDiv.className = 'book-container';
        
        // 💡 1. 책 제목과 버튼을 담을 컨테이너 생성
        const headerDiv = document.createElement('div');
        headerDiv.style.display = 'flex';
        headerDiv.style.justifyContent = 'space-between';
        headerDiv.style.alignItems = 'center';

        const bookTitle = document.createElement('div');
        bookTitle.className = 'book-title';
        bookTitle.textContent = book;
        headerDiv.appendChild(bookTitle);

        // 💡 2. 전체 선택/해제 버튼 생성
        const selectAllButton = document.createElement('button');
        selectAllButton.className = 'select-all-btn';
        selectAllButton.textContent = '전체 선택';
        selectAllButton.dataset.book = book; // 어떤 책인지 구분하기 위해 데이터 속성 저장
        headerDiv.appendChild(selectAllButton);
        
        bookDiv.appendChild(headerDiv); // 컨테이너를 책 DIV에 추가

        const chapterList = document.createElement('div');
        chapterList.className = 'chapter-checkbox-list';

        for (let i = 1; i <= totalChaptersInBook; i++) {
            const chapterId = `${book}-${i}`;
            // readingRecords[book]이 undefined일 경우를 대비해 '|| {}' 추가
            const isChecked = (readingRecords[book] || {})[i];

            const input = document.createElement('input');
            input.type = 'checkbox';
            input.id = chapterId;
            input.value = chapterId;
            input.checked = isChecked || false;
            input.addEventListener('change', handleCheckboxChange);

            const label = document.createElement('label');
            label.htmlFor = chapterId;
            label.textContent = i;

            chapterList.appendChild(input);
            chapterList.appendChild(label);
        }

        bookDiv.appendChild(chapterList);
        listContainer.appendChild(bookDiv);
    }
    // 💡 목록이 생성된 후, 버튼에 이벤트 리스너를 한 번에 붙여줍니다.
    setupSelectAllButtons(); 
}

// 💡 새로운 함수: 전체 선택/해제 로직
function setupSelectAllButtons() {
    const buttons = document.querySelectorAll('.select-all-btn');
    buttons.forEach(button => {
        button.addEventListener('click', toggleSelectAll);
    });
}

function toggleSelectAll(event) {
    const button = event.target;
    const bookName = button.dataset.book;
    
    // 현재 버튼의 텍스트가 '전체 선택'인지 확인하여, 다음에 할 행동을 결정
    const shouldCheck = button.textContent.includes('전체 선택'); 
    
    // 해당 책의 모든 체크박스를 찾습니다.
    const container = button.closest('.book-container');
    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    
    // 로컬 스토리지에 저장할 레코드 업데이트
    if (!readingRecords[bookName]) {
        readingRecords[bookName] = {};
    }
    
    checkboxes.forEach((checkbox, index) => {
        // 체크박스 상태 변경
        checkbox.checked = shouldCheck; 
        
        // 로컬 스토리지 데이터 업데이트 (인덱스가 1부터 시작하므로 index + 1)
        readingRecords[bookName][index + 1] = shouldCheck;
    });

    // 로컬 스토리지에 저장
    localStorage.setItem(recordKey, JSON.stringify(readingRecords));
    
    // 버튼 텍스트 변경
    button.textContent = shouldCheck ? '전체 해제' : '전체 선택';
    
    // 진도 업데이트
    updateProgress();
}

// ==========================================================
// 3. 앱 시작 시 함수 실행
// ==========================================================
document.addEventListener('DOMContentLoaded', setupLoginLogic);

// [script.js] 파일 맨 끝 부분에 추가 (setupLoginLogic 위에)
// [script.js] 파일의 launchConfetti 함수 수정본

// 🌟 폭죽 효과 함수
function launchConfetti(count) {
    const colors = ['#ffd700', '#4CAF50', '#2196F3', '#f44336', '#FFC0CB'];
    
    for (let i = 0; i < count; i++) {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti');
        
        // 랜덤 위치와 크기 설정
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.width = Math.random() * 8 + 5 + 'px';
        confetti.style.height = confetti.style.width;
        
        // 랜덤 색상 적용
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        
        // 🚨🚨🚨 이 부분이 핵심 수정: 애니메이션 적용 🚨🚨🚨
        confetti.style.animationName = 'fall'; // 'fall' 키프레임 적용
        confetti.style.animationFillMode = 'forwards'; // 애니메이션 종료 후 최종 상태 유지
        // 🚨🚨🚨 여기까지 추가해야 해! 🚨🚨🚨
        
        // 랜덤 애니메이션 시간과 딜레이 설정
        confetti.style.animationDuration = Math.random() * 4 + 5 + 's';
        confetti.style.animationDelay = Math.random() * 1 + 's';
        
        document.body.appendChild(confetti);

        // 애니메이션이 끝나면 요소 제거
        confetti.addEventListener('animationend', () => {
            confetti.remove();
        });
    }
}