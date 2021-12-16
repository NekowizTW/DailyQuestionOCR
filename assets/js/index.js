// necessary variable
const searchBox = document.querySelector('#searchBox');
const list = document.querySelector('#list');
const footer = document.querySelector('.footer');
const hideFooter = document.querySelector('.btn-hide');

let questions = [];

// Hide footer

hideFooter.onclick = () => {
    footer.classList.add('hide');
}

// prepare data

async function loadQuestions () {
    const recognized = await fetch('./dailyQuestionOption.json').then(r => r.json());
    const imgList = await fetch('./dailyQuestion.json').then(r => r.json());

    for (let i = 0; i < recognized.length; i++) {
        questions.push({
            q: recognized[i].question,
            o: [recognized[i].answer, ...recognized[i].recognized.filter(oi => oi !== recognized[i].answer)],
            i: imgList[i][0]
        });
    }
    
    // when the problem is loaded, make search box available to search questions
    searchBox.disabled = false;
    searchBox.placeholder = `請輸入「題目」或「部份選項」進行搜尋（共${questions.length}個問題）`;
}

loadQuestions();

// listening keyup event in search box


searchBox.addEventListener('keyup', (e) => {
    if (e.target.disabled) return;

    const val = e.target.value.split(' ').filter(x => x.length > 0);

    if (val.length === 0) return;

    const filted = questions.reduce((lastFilted, question) => {
        let result = {...question, fullfilled: false};

        val.forEach(token => {
            const qIdx = result.q.indexOf(token);

            if (qIdx !== -1) {
                result.fullfilled = true;
                result.q = result.q.replace(token, `<mark>${token}</mark>`);
            }

            result.o = result.o.map(option => {
                const oIdx = option.indexOf(token);
                if (oIdx !== -1) {
                    result.fullfilled = true;
                    option = option.replace(token, `<mark>${token}</mark>`);
                }

                return option;
            })
        });

        if (result.fullfilled) {
            lastFilted.push(result);
        }
        return lastFilted;
    }, []);

    console.log(filted);
    list.innerHTML = '';
    filted.forEach(row => {
        const img = document.createElement('img');
        img.src = row.i;

        const elq = document.createElement('h4');
        elq.innerHTML = row.q;

        const ela = document.createElement('ul');
        ela.innerHTML = row.o.map(oi => `<li>${oi}</li>`).join('');

        const eli = document.createElement('div');
        eli.classList.add('pure-u-1', 'pure-u-md-1-3', 'img');
        eli.appendChild(img);

        const elt = document.createElement('div');
        elt.classList.add('pure-u-1', 'pure-u-md-2-3', 'text');
        elt.appendChild(elq);
        elt.appendChild(ela);

        const elg = document.createElement('div');
        elg.classList.add('pure-g');
        elg.appendChild(eli);
        elg.appendChild(elt);

        list.appendChild(elg);
        list.appendChild(document.createElement('hr'));
    })
})