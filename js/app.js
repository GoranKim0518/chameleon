'use strict';
// Effect a/b values directly control shader parameters; opacity and blending are post-effect.
const p = (label, min, max, def, step=1) => ({
    label,
    min,
    max,
    def,
    step
});
const EFFECTS = [
{
    id: 0,
    name: 'Threshold',
    category: 'TONAL',
    desc: '밝기를 기준으로 흑백을 강하게 분리합니다.',
    a: p('경계값', 0, 1, .48, .01),
    b: p('보조값', 0, 1, .5, .01)
},
{
    id: 1,
    name: 'Posterize',
    category: 'TONAL',
    desc: '채널당 색상 단계를 줄여 평면화합니다.',
    a: p('색상 단계', 2, 16, 4),
    b: p('보조값', 0, 1, .5, .01)
},
{
    id: 12,
    name: 'Solarize',
    category: 'TONAL',
    desc: '선택한 명도 이상에서 색상을 반전합니다.',
    a: p('반전 경계', 0, 1, .45, .01),
    b: p('보조값', 0, 1, .5, .01)
},
{
    id: 13,
    name: 'Invert',
    category: 'TONAL',
    desc: 'RGB 채널을 반전합니다.',
    a: p('반전 기준', 0, 1, .5, .01),
    b: p('보조값', 0, 1, .5, .01)
},
{
    id: 30,
    name: 'Xerox / Photocopy',
    category: 'TONAL',
    desc: '강한 흑백 대비와 거친 복사 질감을 만듭니다.',
    a: p('복사 농도', 0, 1, .51, .01),
    b: p('노이즈 크기', 1, 12, 2)
},
{
    id: 36,
    name: 'Cutout',
    category: 'TONAL',
    desc: '톤과 색을 분절하여 실크스크린처럼 단순화합니다.',
    a: p('단계 수', 2, 12, 4),
    b: p('컬러 비율', 0, 1, .74, .01)
},
{
    id: 37,
    name: 'Liquid Chrome',
    category: 'TONAL',
    desc: '밝기값을 기반으로 금속성 반사 밴드를 만듭니다.',
    a: p('반사 띠', 1, 8, 3, .1),
    b: p('크롬 비율', 0, 1, .94, .01)
},
{
    id: 46,
    name: 'Blacklight',
    category: 'TONAL',
    desc: '이미지의 반전값을 보랏빛으로 강조합니다.',
    a: p('감마', .25, 3, 1.1, .05),
    b: p('보조값', 0, 1, .5, .01)
},

{
    id: 2,
    name: 'Halftone',
    category: 'PRINT',
    desc: '셀 단위 명도에 따라 원형 망점을 형성합니다.',
    a: p('망점 크기', 3, 45, 12),
    b: p('보조값', 0, 1, .5, .01)
},
{
    id: 3,
    name: 'Mono Dither',
    category: 'PRINT',
    desc: '4×4 Bayer 매트릭스로 흑백 디더링합니다.',
    a: p('디더 강도', .1, 2, 1, .05),
    b: p('픽셀 크기', 1, 12, 2)
},
{
    id: 4,
    name: 'Color Dither',
    category: 'PRINT',
    desc: '채널별 색상 수를 줄이고 패턴 디더링합니다.',
    a: p('디더 강도', .1, 2, .9, .05),
    b: p('픽셀 크기', 1, 12, 2)
},
{
    id: 5,
    name: 'Film Grain',
    category: 'PRINT',
    desc: '이미지 위에 픽셀 단위 랜덤 입자를 추가합니다.',
    a: p('입자 강도', 0, 1, .42, .01),
    b: p('보조값', 0, 1, .5, .01)
},
{
    id: 34,
    name: 'Dot Matrix',
    category: 'PRINT',
    desc: '명도에 따라 직경이 변하는 점 행렬입니다.',
    a: p('셀 크기', 4, 45, 12),
    b: p('보조값', 0, 1, .5, .01)
},
{
    id: 35,
    name: 'Crosshatch',
    category: 'PRINT',
    desc: '어두운 영역에 교차 선 묘사를 생성합니다.',
    a: p('선 간격', 4, 30, 11),
    b: p('보조값', 0, 1, .5, .01)
},
{
    id: 44,
    name: 'Print Misregister',
    category: 'PRINT',
    desc: '인쇄 판이 어긋난 듯 색 분판을 이동합니다.',
    a: p('판 이동', 1, 45, 11),
    b: p('보조값', 0, 1, .5, .01)
},
{
    id: 80,
    name: 'Newsprint',
    category: 'PRINT',
    desc: '저해상도 신문 인쇄처럼 도트와 탁한 잉크감을 만듭니다.',
    a: p('도트 크기', 0, 1, .36, .01),
    b: p('잉크 번짐', 0, 1, .44, .01)
},

{
    id: 6,
    name: 'Gaussian Blur',
    category: 'BLUR',
    desc: '3×3 가우시안 커널로 주변 색상을 혼합합니다.',
    a: p('반경', 1, 35, 9),
    b: p('보조값', 0, 1, .5, .01)
},
{
    id: 7,
    name: 'Motion Blur',
    category: 'BLUR',
    desc: '지정한 방향으로 샘플을 누적합니다.',
    a: p('길이', 1, 100, 38),
    b: p('각도', 0, 360, 0)
},
{
    id: 8,
    name: 'Radial Blur',
    category: 'BLUR',
    desc: '화면 중앙을 향해 줌 블러를 만듭니다.',
    a: p('중심 집중도', .01, .5, .18, .01),
    b: p('보조값', 0, 1, .5, .01)
},
{
    id: 9,
    name: 'Sharpen',
    category: 'BLUR',
    desc: '주변 픽셀과의 차이를 이용해 윤곽을 강조합니다.',
    a: p('샘플 거리', 1, 12, 2),
    b: p('보조값', 0, 1, .5, .01)
},
{
    id: 32,
    name: 'Bloom / Glow',
    category: 'BLUR',
    desc: '밝은 영역을 주변으로 확산시킵니다.',
    a: p('발광 반경', 2, 70, 23),
    b: p('빛 강도', 0, 3, 1.7, .05)
},

{
    id: 10,
    name: 'Find Edges',
    category: 'EDGES',
    desc: 'Sobel 연산자로 밝기 경계를 추출합니다.',
    a: p('에지 두께', 1, 10, 2),
    b: p('에지 대비', .5, 8, 3, .1)
},
{
    id: 11,
    name: 'Emboss',
    category: 'EDGES',
    desc: '대각 밝기 차이를 입체적인 음영으로 변환합니다.',
    a: p('엠보싱 거리', 1, 15, 3),
    b: p('깊이', .2, 5, 2, .1)
},
{
    id: 31,
    name: 'Ink Outline',
    category: 'EDGES',
    desc: '명도와 경계선을 조합해 잉크 그림을 만듭니다.',
    a: p('선 굵기', 1, 12, 2),
    b: p('선 강도', 1, 9, 4, .1)
},
{
    id: 45,
    name: 'Neon Contour',
    category: 'EDGES',
    desc: '윤곽을 추출해 청록·자홍빛으로 표현합니다.',
    a: p('검출 두께', 1, 12, 2),
    b: p('발광량', 0, 1, .9, .01)
},
{
    id: 74,
    name: 'Engraving',
    category: 'EDGES',
    desc: '금속 판화나 지폐 같은 선각 질감을 생성합니다.',
    a: p('선 밀도', 0, 1, .42, .01),
    b: p('곡률', 0, 1, .58, .01)
},
{
    id: 78,
    name: 'Scratchboard',
    category: 'EDGES',
    desc: '검은 바탕을 긁어낸 듯한 흰 선 이미지를 만듭니다.',
    a: p('스크래치 양', 0, 1, .48, .01),
    b: p('거칠기', 0, 1, .5, .01)
},
{
    id: 79,
    name: 'Woodcut',
    category: 'EDGES',
    desc: '목판화처럼 굵은 깎임과 높은 대비를 만듭니다.',
    a: p('절삭 강도', 0, 1, .44, .01),
    b: p('나뭇결 양', 0, 1, .46, .01)
},

{
    id: 14,
    name: 'RGB Split',
    category: 'GLITCH',
    desc: 'R/B 채널을 좌우로 분리합니다.',
    a: p('분리 거리', 0, 100, 24),
    b: p('보조값', 0, 1, .5, .01)
},
{
    id: 15,
    name: 'Channel Offset',
    category: 'GLITCH',
    desc: 'RGB 채널을 각도에 따라 어긋나게 합니다.',
    a: p('오프셋', 0, 140, 37),
    b: p('각도', 0, 360, 45)
},
{
    id: 23,
    name: 'Scanlines',
    category: 'GLITCH',
    desc: '수평 주사선으로 아날로그 모니터 질감을 냅니다.',
    a: p('라인 간격', 2, 18, 4),
    b: p('명암 비율', .1, .95, .57, .01)
},
{
    id: 24,
    name: 'CRT Screen',
    category: 'GLITCH',
    desc: '브라운관 곡률·색수차·주사선·비네팅을 결합합니다.',
    a: p('화면 곡률', 0, 2, .8, .05),
    b: p('주사선 간격', 2, 15, 5)
},
{
    id: 25,
    name: 'VHS Tape',
    category: 'GLITCH',
    desc: '행 단위 수평 밀림, RGB 번짐, 신호 노이즈를 만듭니다.',
    a: p('왜곡 크기', 0, 120, 48),
    b: p('라인 크기', 1, 40, 9)
},
{
    id: 26,
    name: 'Block Glitch',
    category: 'GLITCH',
    desc: '랜덤 블록마다 픽셀을 옆으로 이동합니다.',
    a: p('이동 거리', 0, 250, 92),
    b: p('블록 크기', 3, 90, 34)
},
{
    id: 27,
    name: 'Pixel Smear',
    category: 'GLITCH',
    desc: '밝기 기반으로 수평 픽셀을 끌어 늘입니다.',
    a: p('잔상 길이', 1, 180, 80),
    b: p('혼합 강도', 0, 1, .86, .01)
},
{
    id: 29,
    name: 'Chromatic Warp',
    category: 'GLITCH',
    desc: '화면 가장자리 쪽에서 RGB 채널을 방사형으로 분리합니다.',
    a: p('색수차 강도', 0, 140, 55),
    b: p('보조값', 0, 1, .5, .01)
},

{
    id: 16,
    name: 'Wave',
    category: 'DISTORT',
    desc: '정현파를 따라 픽셀을 수평 변위합니다.',
    a: p('진폭', 0, 70, 24),
    b: p('주파수', .5, 18, 5, .5)
},
{
    id: 17,
    name: 'Ripple',
    category: 'DISTORT',
    desc: '중심에서 퍼지는 동심원 물결 왜곡입니다.',
    a: p('진폭', 0, 80, 22),
    b: p('파장 밀도', .2, 5, 1.5, .1)
},
{
    id: 18,
    name: 'Twirl',
    category: 'DISTORT',
    desc: '중심을 기준으로 이미지 좌표를 회전시킵니다.',
    a: p('회전 각도', -720, 720, 200),
    b: p('범위', .1, 1, .5, .01)
},
{
    id: 19,
    name: 'Bulge / Pinch',
    category: 'DISTORT',
    desc: '중심 주변의 좌표를 확대하거나 수축합니다.',
    a: p('변형량', -1.5, 2, -.7, .05),
    b: p('반경', .1, 1, .6, .01)
},
{
    id: 20,
    name: 'Kaleidoscope',
    category: 'DISTORT',
    desc: '극좌표를 대칭 반복해 만화경 패턴을 형성합니다.',
    a: p('대칭 분할', 2, 18, 8),
    b: p('회전', 0, 6.28, .1, .01)
},
{
    id: 21,
    name: 'Pixelate',
    category: 'DISTORT',
    desc: '큰 정사각형 픽셀로 블록화합니다.',
    a: p('픽셀 크기', 2, 110, 25),
    b: p('보조값', 0, 1, .5, .01)
},
{
    id: 22,
    name: 'Mosaic Cells',
    category: 'DISTORT',
    desc: '격자 샘플링에 불규칙성을 부여합니다.',
    a: p('격자 크기', 3, 95, 29),
    b: p('불규칙성', 0, 1, .7, .01)
},
{
    id: 28,
    name: 'Noise Displace',
    category: 'DISTORT',
    desc: '랜덤 벡터 필드로 이미지 좌표를 왜곡합니다.',
    a: p('변위 강도', 0, 100, 39),
    b: p('필드 분할', 2, 130, 29)
},
{
    id: 33,
    name: 'Fluid Warp',
    category: 'DISTORT',
    desc: '중첩 삼각함수 흐름으로 유체처럼 변형합니다.',
    a: p('움직임 크기', 0, 60, 24),
    b: p('흐름 복잡도', .5, 12, 4, .5)
},
{
    id: 38,
    name: 'Mirror',
    category: 'DISTORT',
    desc: '수평, 수직 또는 양축 대칭 복제합니다.',
    a: p('방향 (0 가로 / 1 세로 / 2 양쪽)', 0, 2, 0),
    b: p('보조값', 0, 1, .5, .01)
},
{
    id: 43,
    name: 'Stained Glass',
    category: 'DISTORT',
    desc: '불규칙 셀 안에서 하나의 색상을 샘플링합니다.',
    a: p('조각 크기', 5, 80, 28),
    b: p('불규칙성', 0, 1, .75, .01)
},

{
    id: 47,
    name: 'Duotone Map',
    category: 'COLOR',
    desc: '명도를 두 가지 색상 영역으로 매핑합니다.',
    a: p('기준 색조', 0, 1, .58, .01),
    b: p('대비', 0, 1, .55, .01)
},
{
    id: 48,
    name: 'Gradient Map',
    category: 'COLOR',
    desc: '어두움과 밝음을 서로 다른 색상으로 매핑합니다.',
    a: p('시작 색조', 0, 1, .05, .01),
    b: p('끝 색조 편차', 0, 1, .38, .01)
},
{
    id: 49,
    name: 'Hue Shift',
    category: 'COLOR',
    desc: '이미지 전체의 색상환을 회전시킵니다.',
    a: p('색상 이동', 0, 1, .12, .01),
    b: p('채도 강화', 0, 1, .45, .01)
},
{
    id: 50,
    name: 'Split Tone',
    category: 'COLOR',
    desc: '그림자와 하이라이트에 서로 다른 색조를 입힙니다.',
    a: p('기준 색조', 0, 1, .62, .01),
    b: p('톤 강도', 0, 1, .58, .01)
},
{
    id: 56,
    name: 'Infrared False Color',
    category: 'COLOR',
    desc: '적외선처럼 차가운 색에서 뜨거운 색으로 거짓 색상화합니다.',
    a: p('차가운 톤', 0, 1, .4, .01),
    b: p('뜨거운 톤', 0, 1, .52, .01)
},

{
    id: 52,
    name: 'Paper Fibers',
    category: 'TEXTURE',
    desc: '종이 섬유와 미세한 표면 거칠기를 추가합니다.',
    a: p('섬유 강도', 0, 1, .45, .01),
    b: p('섬유 스케일', 0, 1, .55, .01)
},
{
    id: 53,
    name: 'Frosted Glass',
    category: 'TEXTURE',
    desc: '성애 낀 유리처럼 퍼지고 흐트러진 표면을 만듭니다.',
    a: p('왜곡량', 0, 1, .48, .01),
    b: p('결 크기', 0, 1, .58, .01)
},
{
    id: 54,
    name: 'Ink Bleed',
    category: 'TEXTURE',
    desc: '잉크가 번진 듯 가장자리를 먹먹하게 퍼뜨립니다.',
    a: p('번짐 반경', 0, 1, .36, .01),
    b: p('거칠기', 0, 1, .42, .01)
},
{
    id: 55,
    name: 'Holographic Sheen',
    category: 'TEXTURE',
    desc: '무지갯빛 홀로그램 막처럼 표면 광택을 얹습니다.',
    a: p('색조 위치', 0, 1, .2, .01),
    b: p('광택량', 0, 1, .5, .01)
},
{
    id: 58,
    name: 'Marble Veins',
    category: 'TEXTURE',
    desc: '대리석 같은 결무늬를 입혀 특수 표면감을 만듭니다.',
    a: p('결 강도', 0, 1, .44, .01),
    b: p('결 밀도', 0, 1, .46, .01)
},
{
    id: 63,
    name: 'Canvas Weave',
    category: 'TEXTURE',
    desc: '캔버스 천의 직조 결을 이미지 위에 입힙니다.',
    a: p('결 강도', 0, 1, .38, .01),
    b: p('직조 크기', 0, 1, .5, .01)
},
{
    id: 64,
    name: 'Paper Grain',
    category: 'TEXTURE',
    desc: '거친 종이 표면과 잔입자를 추가합니다.',
    a: p('입자량', 0, 1, .42, .01),
    b: p('섬유 크기', 0, 1, .5, .01)
},
{
    id: 72,
    name: 'Watercolor Paper',
    category: 'TEXTURE',
    desc: '수채화지의 요철과 흡수된 결을 만듭니다.',
    a: p('종이 강도', 0, 1, .44, .01),
    b: p('흡수감', 0, 1, .5, .01)
},
{
    id: 75,
    name: 'Sponge Texture',
    category: 'TEXTURE',
    desc: '스펀지로 두드린 듯한 얼룩과 반점 질감을 만듭니다.',
    a: p('반점 양', 0, 1, .48, .01),
    b: p('패턴 크기', 0, 1, .54, .01)
},
{
    id: 76,
    name: 'Stucco Relief',
    category: 'TEXTURE',
    desc: '벽면 플라스터 같은 요철 텍스처를 생성합니다.',
    a: p('요철 강도', 0, 1, .46, .01),
    b: p('입자 스케일', 0, 1, .52, .01)
},

{
    id: 65,
    name: 'Crayon',
    category: 'ANALOG',
    desc: '크레용으로 덧칠한 듯 거칠고 부드러운 스트로크를 만듭니다.',
    a: p('스트로크 양', 0, 1, .48, .01),
    b: p('색 단순화', 0, 1, .38, .01)
},
{
    id: 66,
    name: 'Oil Pastel',
    category: 'ANALOG',
    desc: '오일 파스텔처럼 두툼하고 문질러진 색면을 만듭니다.',
    a: p('뭉침 강도', 0, 1, .52, .01),
    b: p('문지름 양', 0, 1, .44, .01)
},
{
    id: 67,
    name: 'Chalk Dust',
    category: 'ANALOG',
    desc: '분필가루가 날리는 듯한 매트한 재질을 입힙니다.',
    a: p('가루 양', 0, 1, .46, .01),
    b: p('거칠기', 0, 1, .5, .01)
},
{
    id: 68,
    name: 'Charcoal',
    category: 'ANALOG',
    desc: '목탄으로 문지른 듯한 흑연성 명암과 번짐을 만듭니다.',
    a: p('문지름 양', 0, 1, .44, .01),
    b: p('선 강도', 0, 1, .55, .01)
},
{
    id: 69,
    name: 'Dry Brush',
    category: 'ANALOG',
    desc: '마른 붓자국처럼 듬성듬성 끊기는 획을 생성합니다.',
    a: p('붓결 양', 0, 1, .46, .01),
    b: p('거침', 0, 1, .5, .01)
},
{
    id: 70,
    name: 'Impasto',
    category: 'ANALOG',
    desc: '두껍게 올라간 물감의 입체적인 붓 터치를 만듭니다.',
    a: p('물감 두께', 0, 1, .5, .01),
    b: p('붓 결 방향성', 0, 1, .44, .01)
},
{
    id: 71,
    name: 'Colored Pencil',
    category: 'ANALOG',
    desc: '색연필의 사선 결을 유지하면서 색을 다시 칠합니다.',
    a: p('선 밀도', 0, 1, .42, .01),
    b: p('채색량', 0, 1, .52, .01)
},
{
    id: 73,
    name: 'Gouache Flat',
    category: 'ANALOG',
    desc: '불투명 과슈처럼 색면을 깔끔하게 정리하고 종이 재질을 남깁니다.',
    a: p('평탄화', 0, 1, .44, .01),
    b: p('재질 혼합', 0, 1, .4, .01)
},
{
    id: 77,
    name: 'Wax Crayon',
    category: 'ANALOG',
    desc: '왁스가 묻어난 크레파스 같은 미끄러운 질감을 만듭니다.',
    a: p('왁스 양', 0, 1, .48, .01),
    b: p('문지름 양', 0, 1, .46, .01)
},

{
    id: 51,
    name: 'Neon Glow',
    category: 'LIGHT',
    desc: '밝은 영역에 컬러 네온광을 씌웁니다.',
    a: p('네온 색조', 0, 1, .53, .01),
    b: p('발광량', 0, 1, .72, .01)
},
{
    id: 59,
    name: 'Neon Poster',
    category: 'LIGHT',
    desc: '포스터라이즈와 형광 윤곽광을 결합합니다.',
    a: p('단계 수', 0, 1, .45, .01),
    b: p('형광량', 0, 1, .62, .01)
},
{
    id: 62,
    name: 'Haze Wash',
    category: 'LIGHT',
    desc: '부드러운 헤이즈와 공기감을 더해 몽환적인 세척 효과를 만듭니다.',
    a: p('헤이즈 반경', 0, 1, .3, .01),
    b: p('색조량', 0, 1, .3, .01)
},

{
    id: 39,
    name: 'Difference Shift',
    category: 'BLENDING',
    desc: '원본 또는 두 번째 이미지와의 절대 차이를 계산합니다.',
    a: p('수평 이동', -250, 250, 32),
    b: p('수직 이동', -250, 250, 0)
},
{
    id: 40,
    name: 'Exclusion Shift',
    category: 'BLENDING',
    desc: '원본/두 번째 이미지를 Exclusion 연산으로 결합합니다.',
    a: p('수평 이동', -250, 250, 30),
    b: p('수직 이동', -250, 250, 0)
},
{
    id: 41,
    name: 'Double Exposure',
    category: 'BLENDING',
    desc: '원본/두 번째 이미지를 겹쳐 다중 노출을 구현합니다.',
    a: p('수평 이동', -250, 250, 44),
    b: p('수직 이동', -250, 250, 0)
},
{
    id: 42,
    name: 'Ghost Trail',
    category: 'BLENDING',
    desc: '이미지 복제본을 여러 위치에 겹쳐 잔상을 만듭니다.',
    a: p('수평 거리', -140, 140, 25),
    b: p('수직 거리', -140, 140, 0)
},

{
    id: 57,
    name: 'Prism Split',
    category: 'EXPERIMENTAL',
    desc: '가장자리 쪽으로 프리즘처럼 스펙트럼을 갈라냅니다.',
    a: p('분리량', 0, 1, .48, .01),
    b: p('혼합량', 0, 1, .58, .01)
},
{
    id: 60,
    name: 'Chameleon Shift',
    category: 'EXPERIMENTAL',
    desc: '영역별로 색이 적응하듯 변하는 카멜레온 전용 필터입니다.',
    a: p('변이 강도', 0, 1, .38, .01),
    b: p('패치 크기', 0, 1, .44, .01)
},
{
    id: 61,
    name: 'Luma Melt',
    category: 'EXPERIMENTAL',
    desc: '밝기 정보가 아래로 녹아내리듯 흐르는 특이한 잔상 효과입니다.',
    a: p('흐름량', 0, 1, .4, .01),
    b: p('분할 크기', 0, 1, .52, .01)
}
];
const BLENDS = [['Normal', 0], ['Dissolve', 15], ['Multiply', 1], ['Screen', 2], ['Overlay', 3], ['Difference', 4], ['Exclusion', 5], ['Add', 6], ['Subtract', 7], ['Darken', 8], ['Lighten', 9], ['Color Dodge', 10], ['Color Burn', 11], ['Hard Light', 12], ['Soft Light', 13], ['Divide', 14]];
const CATEGORIES = ['ALL', 'TONAL', 'PRINT', 'BLUR', 'EDGES', 'GLITCH', 'DISTORT', 'COLOR', 'TEXTURE', 'ANALOG', 'LIGHT', 'BLENDING', 'EXPERIMENTAL'];
const byId = new Map(EFFECTS.map(e => [e.id, e]));
const $ = id => document.getElementById(id);
const trackAnalytics = (event, params = {}) => window.CHAMELEON_ANALYTICS?.track?.(event, params);
const reportAnalyticsError = (feature, error) => window.CHAMELEON_ANALYTICS?.error?.(feature, error);
const state = {
    layers: [],
    selection: null,
    selectedImageLayer: null,
    category: 'ALL',
    query: '',
    source: null,
    filename: 'CHAMELEON_SAMPLE.JPG',
    compare: false,
    zoom: 'fit',
    sample: true,
    processing: false,
    imageLayers: []
};
let engine,
    thumbEngine,
    toastTimer,
    thumbGeneration = 0,
    renderQueued = false,
    nextKey = 1,
    nextImageKey = 1,
    activeCanvasGesture = null;
const activePointers = new Map();
const snapGuides = {
    x: null,
    y: null
};
let thumbObserver = null,
    exportBlob = null,
    exportBlobUrl = null;
const compactQuery = window.matchMedia('(max-width:1250px)');
const isCompact = () => compactQuery.matches;
const onTouchDevice = () => window.matchMedia('(pointer:coarse)').matches;
const previewLimit = () => onTouchDevice() ? 900 : 1400;
function switchPanel(panel) {
    if (!['filters', 'stack', 'adjust'].includes(panel))
        return;
    const workspace = $('workspace');
    workspace.dataset.activePanel = panel;
    document.querySelectorAll('.mobile-tab').forEach(btn => {
        const active = btn.dataset.panel === panel;
        btn.classList.toggle('active', active);
        btn.setAttribute('aria-selected', String(active));
    });
    if (panel === 'filters')
        refreshThumbsVisible();
    requestAnimationFrame(fitCanvas);
}
function refreshThumbsVisible() {
    if (thumbObserver && isCompact())
        requestAnimationFrame(() => {
            document.querySelectorAll('#effectGrid .effect-card').forEach(el => thumbObserver.observe(el));
        });
}
function notify(message) {
    $('toast').textContent = message;
    $('toast').classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => $('toast').classList.remove('show'), 2800);
}

// Per-session history of both image layers and effects. Images are held by reference;
// no giant pixel buffers or file data are duplicated for every action.
const history = {
    past: [],
    future: [],
    limit: 60,
    restoring: false
};
const gestureStarted = new WeakSet();
function captureHistory() {
    return {
        layers: state.layers.map(l => ({
            ...l
        })),
        imageLayers: state.imageLayers.map(l => ({
            ...l
        })),
        selection: state.selection,
        selectedImageLayer: state.selectedImageLayer,
        sample: state.sample
    };
}
function updateHistoryButtons() {
    const undoBtn = $('undoBtn'),
        redoBtn = $('redoBtn');
    if (undoBtn)
        undoBtn.disabled = history.past.length === 0;
    if (redoBtn)
        redoBtn.disabled = history.future.length === 0;
}
function recordHistory() {
    if (history.restoring)
        return;
    history.past.push(captureHistory());
    if (history.past.length > history.limit)
        history.past.shift();
    history.future.length = 0;
    updateHistoryButtons();
}
function beginHistoryGesture(control) {
    if (gestureStarted.has(control))
        return;
    gestureStarted.add(control);
    recordHistory();
    control.addEventListener('change', () => gestureStarted.delete(control), {
        once: true
    });
    control.addEventListener('blur', () => gestureStarted.delete(control), {
        once: true
    });
}
function sameImageLayers(a, b) {
    return a.length === b.length && a.every((layer, i) => {
            const other = b[i];
            return layer.key === other.key && layer.img === other.img &&
                layer.opacity === other.opacity && layer.blend === other.blend && layer.visible === other.visible &&
                layer.x === other.x && layer.y === other.y && layer.scale === other.scale &&
                layer.rotation === other.rotation && layer.name === other.name;
        });
}
function restoreHistory(snapshot) {
    const oldImages = state.imageLayers;
    history.restoring = true;
    try {
        state.layers = snapshot.layers.map(l => ({
            ...l
        }));
        state.imageLayers = snapshot.imageLayers.map(l => ({
            ...l
        }));
        state.selection = snapshot.selection;
        state.selectedImageLayer = snapshot.selectedImageLayer;
        state.sample = snapshot.sample;
        nextKey = Math.max(nextKey, ...state.layers.map(l => l.key + 1), 1);
        nextImageKey = Math.max(nextImageKey, ...state.imageLayers.map(l => l.key + 1), 1);
        updateImageLayers();
        updateStack();
        updateSettings();
        refreshLayerInfo();
        schedulePersistence();
        if (!sameImageLayers(oldImages, state.imageLayers))
            rebuildComposite();
        else
            scheduleRender();
    } finally {
        history.restoring = false;
        updateHistoryButtons();
    }
}
function undo() {
    if (!history.past.length || state.processing)
        return;
    history.future.push(captureHistory());
    restoreHistory(history.past.pop());
    notify('이전 편집으로 돌아갔습니다.');
}
function redo() {
    if (!history.future.length || state.processing)
        return;
    history.past.push(captureHistory());
    restoreHistory(history.future.pop());
    notify('편집을 다시 적용했습니다.');
}

function fmt(x) {
    return Number.isInteger(+x) ? String(x) : (+x).toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
}
function debounce(fn, ms) {
    let t;
    return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn(...args), ms);
    };
}
function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, ch => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[ch]));
}
const CHAMELEON_SAMPLE = 'data:image/jpeg;base64,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';

function sampleImage() {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = CHAMELEON_SAMPLE;
    });
}
function newLayer(id) {
    const fx = byId.get(id);
    return {
        key: nextKey++,
        id,
        a: fx.a.def,
        b: fx.b.def,
        opacity: 100,
        blend: 0,
        enabled: true,
        seed: Math.random() * 1000 | 0
    };
}
const LAYER_BLENDS = [['Normal', 'source-over'], ['Multiply', 'multiply'], ['Screen', 'screen'], ['Overlay', 'overlay'], ['Difference', 'difference'], ['Exclusion', 'exclusion'], ['Lighten', 'lighten'], ['Darken', 'darken'], ['Soft Light', 'soft-light'], ['Hard Light', 'hard-light']];
function layerBlendLabel(mode) {
    return LAYER_BLENDS.find(x => x[1] === mode)?.[0] || 'Normal';
}
function newImageLayer(img, name) {
    return {
        key: nextImageKey++,
        name: name || `LAYER_${nextImageKey}`,
        img,
        opacity: 100,
        blend: 'source-over',
        visible: true,
        x: 0,
        y: 0,
        scale: 1,
        rotation: 0
    };
}
function getBaseLayer() {
    return state.imageLayers[0] || null;
}
function selectEffectLayer(key) {
    state.selection = key;
    state.selectedImageLayer = null;
    updateStack();
    updateImageLayers();
    updateSettings();
    if (isCompact())
        switchPanel('adjust');
}
function selectImageLayer(key) {
    state.selectedImageLayer = key;
    state.selection = null;
    updateStack();
    updateImageLayers();
    updateSettings();
    if (isCompact())
        switchPanel('adjust');
}
function addEffect(id) {
    if (state.layers.length >= 30) {
        notify('최대 30개 이펙트까지 추가할 수 있어요.');
        return;
    }
    recordHistory();
    state.layers.push(newLayer(id));
    trackAnalytics('effect_added', { effect_id: id, effect_count: state.layers.length });
    state.selection = state.layers.at(-1).key;
    state.selectedImageLayer = null;
    commitStack();
    if (isCompact())
        switchPanel('stack');
}
function moveEffectLayer(key, dir) {
    const i = state.layers.findIndex(x => x.key === key);
    if (i < 0)
        return;
    const j = i + dir;
    if (j < 0 || j >= state.layers.length)
        return;
    recordHistory();
    [state.layers[i], state.layers[j]] = [state.layers[j], state.layers[i]];
    commitStack();
}
function removeEffectLayer(key) {
    const i = state.layers.findIndex(x => x.key === key);
    if (i < 0)
        return;
    recordHistory();
    state.layers.splice(i, 1);
    if (state.selection === key)
        state.selection = state.layers[Math.max(0, i - 1)]?.key ?? null;
    commitStack();
}
function commitStack() {
    updateStack();
    updateSettings();
    refreshLayerInfo();
    scheduleRender();
    schedulePersistence();
}
function moveImageLayer(key, dir) {
    const i = state.imageLayers.findIndex(x => x.key === key);
    if (i < 0)
        return;
    const j = i + dir;
    if (j < 0 || j >= state.imageLayers.length)
        return;
    recordHistory();
    [state.imageLayers[i], state.imageLayers[j]] = [state.imageLayers[j], state.imageLayers[i]];
    updateDocumentMeta();
    commitImageLayers();
}
function removeImageLayer(key) {
    if (state.imageLayers.length <= 1) {
        notify('최소 1개의 이미지 레이어는 유지해야 합니다.');
        return;
    }
    const i = state.imageLayers.findIndex(x => x.key === key);
    if (i < 0)
        return;
    recordHistory();
    state.imageLayers.splice(i, 1);
    if (state.selectedImageLayer === key)
        state.selectedImageLayer = state.imageLayers[Math.max(0, i - 1)]?.key ?? null;
    updateDocumentMeta();
    commitImageLayers();
}
function commitImageLayers() {
    updateImageLayers();
    updateSettings();
    refreshLayerInfo();
    rebuildComposite();
}
function renderCategories() {
    const root = $('categories');
    root.innerHTML = CATEGORIES.map(cat => `<button class="category ${state.category === cat ? 'selected' : ''}" data-cat="${cat}">${cat}</button>`).join('');
    root.querySelectorAll('button').forEach(btn => btn.onclick = () => {
        state.category = btn.dataset.cat;
        renderCategories();
        renderLibrary();
    });
}
function filteredEffects() {
    return EFFECTS.filter(fx => (state.category === 'ALL' || fx.category === state.category) && (!state.query || (`${fx.name} ${fx.category} ${fx.desc}`).toLowerCase().includes(state.query)));
}
function renderLibrary() {
    const list = filteredEffects();
    $('effectCount').textContent = String(list.length).padStart(2, '0');
    const grid = $('effectGrid');
    if (!list.length) {
        grid.innerHTML = '<div class="empty-search">검색 결과가 없습니다.<br/>다른 키워드나 카테고리를 시도해보세요.</div>';
        return;
    }
    grid.innerHTML = list.map(fx => `<button class="effect-card" data-id="${fx.id}"><span class="thumb"><span class="thumb-placeholder">✦</span><span class="thumb-plus">＋</span></span><span class="effect-meta"><span class="effect-title">${escapeHtml(fx.name)}</span><span class="effect-index">${fx.category}</span></span></button>`).join('');
    grid.querySelectorAll('.effect-card').forEach(card => card.onclick = () => addEffect(+card.dataset.id));
    generateThumbs(list);
}
function generateThumbs(effects) {
    thumbGeneration++;
    const generation = thumbGeneration;
    if (!state.source)
        return;
    const small = document.createElement('canvas');
    small.width = 210;
    small.height = 160;
    const ctx = small.getContext('2d');
    const img = state.source;
    const iw = img.naturalWidth || img.width,
        ih = img.naturalHeight || img.height;
    const ratio = Math.max(210 / iw, 160 / ih),
        w = iw * ratio,
        h = ih * ratio;
    ctx.drawImage(img, (210 - w) / 2, (160 - h) / 2, w, h);
    let secondary = null;
    if (state.imageLayers.length > 1) {
        secondary = document.createElement('canvas');
        secondary.width = 210;
        secondary.height = 160;
        const sctx = secondary.getContext('2d');
        const raw = buildCompositeCanvas(secondary, 210, true);
        if (raw !== secondary) {
            sctx.clearRect(0, 0, 210, 160);
            sctx.drawImage(raw, 0, 0, 210, 160);
        }
    }
    let fallbackSource = null;
    try {
        if (thumbEngine)
            thumbEngine.setSource(small, 210, secondary);
        else
            fallbackSource = small.toDataURL('image/jpeg', .72);
    } catch (err) {
        fallbackSource = small.toDataURL('image/jpeg', .72);
    }
    const queue = [],
        seen = new Set();
    let busy = false;
    const drain = () => {
        if (generation !== thumbGeneration)
            return;
        let processed = 0;
        while (queue.length && processed < 2) {
            const item = queue.shift();
            processed++;
            const card = $('effectGrid').querySelector(`[data-id="${item.id}"]`);
            if (!card)
                continue;
            const node = card.querySelector('.thumb');
            if (!node || node.querySelector('img'))
                continue;
            try {
                let src = fallbackSource;
                if (!src) {
                    const fx = byId.get(item.id);
                    thumbEngine.render([{
                        id: fx.id,
                        a: fx.a.def,
                        b: fx.b.def,
                        opacity: 100,
                        blend: 0,
                        enabled: true,
                        seed: 7 + fx.id * 13
                    }], false);
                    src = thumbEngine.canvas.toDataURL('image/jpeg', .7);
                }
                const image = new Image();
                image.alt = item.name + ' 미리보기';
                image.src = src;
                node.querySelector('.thumb-placeholder')?.remove();
                node.prepend(image);
            } catch (err) {
                console.warn('Thumbnail failed', item.name, err);
            }
        }
        if (queue.length)
            requestAnimationFrame(drain);
        else
            busy = false;
    };
    const enqueue = fx => {
        if (generation !== thumbGeneration || seen.has(fx.id))
            return;
        seen.add(fx.id);
        queue.push(fx);
        if (!busy) {
            busy = true;
            requestAnimationFrame(drain);
        }
    };
    const cardList = Array.from($('effectGrid').querySelectorAll('.effect-card'));
    if ('IntersectionObserver' in window) {
        const effectMap = new Map(effects.map(e => [e.id, e]));
        thumbObserver?.disconnect();
        thumbObserver = new IntersectionObserver(entries => {
            for (const entry of entries) {
                if (entry.isIntersecting) {
                    const fx = effectMap.get(+entry.target.dataset.id);
                    if (fx)
                        enqueue(fx);
                    thumbObserver?.unobserve(entry.target);
                }
            }
        }, {
            root: $('effectsScroll'),
            rootMargin: '220px 0px',
            threshold: 0.01
        });
        cardList.forEach(c => thumbObserver.observe(c));
    } else
        effects.forEach(enqueue);
}
function updateImageLayers() {
    const root = $('imageLayerList');
    if (!root)
        return;
    $('imageLayerCount').textContent = String(state.imageLayers.length).padStart(2, '0');
    if (!state.imageLayers.length) {
        root.innerHTML = '<div class="stack-blank"><div class="blank-mark">▣</div><strong>NO IMAGE LAYERS</strong><p>이미지를 업로드해 베이스를 만들어주세요.</p></div>';
        updateCanvasOverlay();
        return;
    }
    root.innerHTML = state.imageLayers.map((l, i) => `<div class="stack-item ${state.selectedImageLayer === l.key ? 'selected' : ''} ${l.visible ? '' : 'is-off'}" data-key="${l.key}" role="button" tabindex="0"><div class="stack-main"><span class="stack-number">${String(i + 1).padStart(2, '0')}</span><span class="stack-name">${escapeHtml(l.name)}</span><div class="stack-controls"><button class="tiny-icon" data-action="toggle" title="보이기/숨기기">${l.visible ? '◉' : '◌'}</button><button class="tiny-icon" data-action="up" title="위로 이동" ${i === 0 ? 'disabled' : ''}>↑</button><button class="tiny-icon" data-action="down" title="아래로 이동" ${i === state.imageLayers.length - 1 ? 'disabled' : ''}>↓</button><button class="tiny-icon remove" data-action="remove" title="삭제" ${state.imageLayers.length <= 1 ? 'disabled' : ''}>×</button></div></div><div class="stack-sub"><span>${i === 0 ? 'BASE IMAGE' : 'IMAGE LAYER'}</span><span><strong>${l.opacity}%</strong> · ${layerBlendLabel(l.blend)}</span></div></div>`).join('');
    root.querySelectorAll('.stack-item').forEach(item => {
        const key = +item.dataset.key;
        item.onclick = e => {
            const btn = e.target.closest('button[data-action]');
            if (!btn) {
                selectImageLayer(key);
                return;
            }
            e.stopPropagation();
            const layer = state.imageLayers.find(x => x.key === key);
            if (!layer)
                return;
            switch (btn.dataset.action) {
            case 'toggle':
                recordHistory();
                layer.visible = !layer.visible;
                commitImageLayers();
                break;
            case 'up':
                moveImageLayer(key, -1);
                break;
            case 'down':
                moveImageLayer(key, 1);
                break;
            case 'remove':
                removeImageLayer(key);
                break;
            }
        };
        item.onkeydown = e => {
            if (e.key === 'Enter' && e.target === item) {
                selectImageLayer(key);
            }
        };
    });
    updateCanvasOverlay();
}
function updateStack() {
    $('stackCount').textContent = String(state.layers.length).padStart(2, '0');
    if ($('mobileStackCount'))
        $('mobileStackCount').textContent = String(state.layers.length);
    if (!state.layers.length) {
        $('stackList').innerHTML = '<div class="stack-blank"><div class="blank-mark">✳</div><strong>YOUR EFFECT STACK IS CLEAR</strong><p>왼쪽의 효과를 클릭해<br/>새로운 조합을 만들어 보세요.</p></div>';
        return;
    }
    $('stackList').innerHTML = state.layers.map((l, i) => {
        let e = byId.get(l.id);
        return `<div class="stack-item ${state.selection === l.key ? 'selected' : ''} ${l.enabled ? '' : 'is-off'}" data-key="${l.key}" role="button" tabindex="0"><div class="stack-main"><span class="stack-number">${String(i + 1).padStart(2, '0')}</span><span class="stack-name">${escapeHtml(e.name)}</span><div class="stack-controls"><button class="tiny-icon" data-action="toggle" title="켜기/끄기">${l.enabled ? '◉' : '◌'}</button><button class="tiny-icon" data-action="up" title="위로 이동" ${i === 0 ? 'disabled' : ''}>↑</button><button class="tiny-icon" data-action="down" title="아래로 이동" ${i === state.layers.length - 1 ? 'disabled' : ''}>↓</button><button class="tiny-icon remove" data-action="remove" title="삭제">×</button></div></div><div class="stack-sub"><span>${e.category}</span><span><strong>${l.opacity}%</strong> · ${BLENDS.find(b => b[1] === l.blend)?.[0] || 'Normal'}</span></div></div>`;
    }).join('');
    $('stackList').querySelectorAll('.stack-item').forEach(item => {
        const key = +item.dataset.key;
        item.onclick = e => {
            const btn = e.target.closest('button[data-action]');
            if (!btn) {
                selectEffectLayer(key);
                return;
            }
            e.stopPropagation();
            const layer = state.layers.find(x => x.key === key);
            if (!layer)
                return;
            switch (btn.dataset.action) {
            case 'toggle':
                recordHistory();
                layer.enabled = !layer.enabled;
                commitStack();
                break;
            case 'up':
                moveEffectLayer(key, -1);
                break;
            case 'down':
                moveEffectLayer(key, 1);
                break;
            case 'remove':
                removeEffectLayer(key);
                break;
            }
        };
        item.onkeydown = e => {
            if (e.key === 'Enter' && e.target === item) {
                selectEffectLayer(key);
            }
        };
    });
}
function layerBlendHelp(mode) {
    return mode === 'source-over' ? '현재 합성 이미지 위에 그대로 겹칩니다.' : '이 이미지 레이어를 아래 레이어와 혼합하는 방식입니다.';
}
function blendHelp(blend) {
    if (blend === 15)
        return 'Dissolve: 불투명도를 픽셀별 확률로 적용합니다. 100%에서는 Normal과 동일하게 보입니다.';
    if (blend === 4)
        return 'Difference: 기존 결과와 새 효과 결과의 RGB 차이를 계산합니다.';
    return '현재 스택의 이미지와 새 효과 결과를 이 방식으로 혼합합니다.';
}
function updateSettings() {
    const root = $('settingsContent');
    const imgLayer = state.imageLayers.find(x => x.key === state.selectedImageLayer);
    const fxLayer = state.layers.find(x => x.key === state.selection);
    $('resetEffectBtn').hidden = !fxLayer;
    if (imgLayer) {
        $('resetEffectBtn').hidden = true;
        root.innerHTML = `<div class="selected-effect-head"><div class="subtype">IMAGE LAYER</div><h3>${escapeHtml(imgLayer.name)}</h3><p>이미지 레이어의 위치, 크기, 투명도, 혼합 방식을 조절합니다.</p></div><div class="field"><div class="field-row"><label for="field-layer-opacity">레이어 불투명도</label><output id="value-layer-opacity">${imgLayer.opacity}%</output></div><input id="field-layer-opacity" type="range" min="0" max="100" step="1" value="${imgLayer.opacity}"/></div><div class="field"><div class="field-row"><label for="field-layer-scale">크기</label><output id="value-layer-scale">${fmt(imgLayer.scale)}x</output></div><input id="field-layer-scale" type="range" min="0.05" max="8" step="0.01" value="${imgLayer.scale}"/></div><div class="field"><div class="field-row"><label for="field-layer-x">가로 위치</label><output id="value-layer-x">${imgLayer.x}%</output></div><input id="field-layer-x" type="range" min="-200" max="200" step="1" value="${imgLayer.x}"/></div><div class="field"><div class="field-row"><label for="field-layer-y">세로 위치</label><output id="value-layer-y">${imgLayer.y}%</output></div><input id="field-layer-y" type="range" min="-200" max="200" step="1" value="${imgLayer.y}"/></div><div class="field"><div class="field-row"><label for="field-layer-rotation">회전</label><output id="value-layer-rotation">${imgLayer.rotation}°</output></div><input id="field-layer-rotation" type="range" min="-180" max="180" step="1" value="${imgLayer.rotation}"/></div><div class="field"><div class="field-row"><label for="field-layer-blend">레이어 혼합</label></div><select id="field-layer-blend">${LAYER_BLENDS.map(([name, val]) => `<option value="${val}" ${imgLayer.blend === val ? 'selected' : ''}>${name}</option>`).join('')}</select><p class="blend-explainer" id="blendHelp">${layerBlendHelp(imgLayer.blend)}</p></div>`;
        [['opacity', 'layer-opacity', '%'], ['scale', 'layer-scale', 'x'], ['x', 'layer-x', '%'], ['y', 'layer-y', '%'], ['rotation', 'layer-rotation', '°']].forEach(([key, id, suffix]) => {
            $('field-' + id).addEventListener('input', e => {
                beginHistoryGesture(e.target);
                imgLayer[key] = +e.target.value;
                $('value-' + id).textContent = fmt(imgLayer[key]) + suffix;
                updateImageLayers();
                rebuildComposite(false);
            });
        });
        $('field-layer-blend').onchange = e => {
            if (imgLayer.blend === e.target.value)
                return;
            recordHistory();
            imgLayer.blend = e.target.value;
            $('blendHelp').textContent = layerBlendHelp(imgLayer.blend);
            updateImageLayers();
            rebuildComposite(false);
        };
        return;
    }
    if (!fxLayer) {
        root.innerHTML = '<div class="params-placeholder"><div class="icon-big">⌁</div><strong>SELECT AN IMAGE LAYER OR EFFECT</strong><p>이미지 레이어를 선택해 위치를 조절하거나,<br/>효과를 선택해 파라미터를 바꿔보세요.</p></div>';
        return;
    }
    const e = byId.get(fxLayer.id);
    const field = (key, def) => `<div class="field"><div class="field-row"><label for="field-${key}">${escapeHtml(def.label)}</label><output id="value-${key}">${fmt(fxLayer[key])}</output></div><input id="field-${key}" type="range" min="${def.min}" max="${def.max}" step="${def.step}" value="${fxLayer[key]}"/></div>`;
    const secondaryNote = [39, 40, 41].includes(fxLayer.id) ? `<div class="second-image-status">${state.imageLayers.length > 1 ? '● 추가 이미지 레이어가 보조 입력으로 함께 합성됩니다.' : '○ 현재는 단일 이미지입니다. 여러 이미지 레이어를 추가하면 더 흥미로운 결과를 얻을 수 있어요.'}</div>` : '';
    root.innerHTML = `<div class="selected-effect-head"><div class="subtype">${e.category} / EFFECT ${String(e.id + 1).padStart(2, '0')}</div><h3>${escapeHtml(e.name)}</h3><p>${escapeHtml(e.desc)}</p></div>${e.id === 13 ? '' : field('a', e.a)}${e.b.label === '보조값' ? '' : field('b', e.b)}<div class="field"><div class="field-row"><label for="field-opacity">효과 강도 / 불투명도</label><output id="value-opacity">${fxLayer.opacity}%</output></div><input id="field-opacity" type="range" min="0" max="100" step="1" value="${fxLayer.opacity}"/></div><div class="field"><div class="field-row"><label for="field-blend">BLEND MODE</label></div><select id="field-blend">${BLENDS.map(([name, id]) => `<option value="${id}" ${fxLayer.blend === id ? 'selected' : ''}>${name}</option>`).join('')}</select><p class="blend-explainer" id="blendHelp">${blendHelp(fxLayer.blend)}</p></div>${secondaryNote}`;
    ['a', 'b', 'opacity'].filter(key => $('field-' + key)).forEach(key => {
        $('field-' + key).addEventListener('input', ev => {
            beginHistoryGesture(ev.target);
            fxLayer[key] = +ev.target.value;
            $('value-' + key).textContent = fmt(fxLayer[key]) + (key === 'opacity' ? '%' : '');
            scheduleRender();
            refreshLayerInfo();
            schedulePersistence();
        });
        $('field-' + key).addEventListener('change', () => updateStack());
    });
    $('field-blend').onchange = e2 => {
        if (fxLayer.blend === +e2.target.value)
            return;
        recordHistory();
        fxLayer.blend = +e2.target.value;
        $('blendHelp').textContent = blendHelp(fxLayer.blend);
        commitStack();
    };
    $('resetEffectBtn').hidden = false;
}
function refreshLayerInfo() {
    const visibleImages = state.imageLayers.filter(x => x.visible).length;
    $('layerInfo').textContent = `${visibleImages} IMAGE LAYERS · ${state.layers.filter(x => x.enabled).length} ACTIVE EFFECTS`;
}
const schedulePersistence = debounce(() => {
    try {
        localStorage.setItem('chameleon_stack', JSON.stringify(state.layers.map(({id, a, b, opacity, blend, enabled, seed}) => ({
            id,
            a,
            b,
            opacity,
            blend,
            enabled,
            seed
        }))));
    } catch (_) {}
}, 280);
function scheduleRender() {
    if (renderQueued)
        return;
    renderQueued = true;
    requestAnimationFrame(() => {
        renderQueued = false;
        try {
            engine.render(state.layers, state.compare);
        } catch (e) {
            console.error(e);
            reportAnalyticsError('render', e);
            notify('렌더링 오류: ' + e.message);
        }
    });
}
function fitCanvas() {
    if (!engine?.width)
        return;
    const area = $('canvasArea'),
        shell = $('artShell');
    const rect = area.getBoundingClientRect();
    if (state.zoom === 'actual') {
        $('canvasArea').style.overflow = 'auto';
        $('canvasArea').style.justifyContent = 'flex-start';
        $('canvasArea').style.alignItems = 'flex-start';
        shell.style.flexShrink = '0';
        shell.style.maxWidth = 'none';
        shell.style.maxHeight = 'none';
        shell.style.width = engine.width + 'px';
        shell.style.height = engine.height + 'px';
        $('zoomLabel').textContent = '100%';
    } else {
        $('canvasArea').style.overflow = 'hidden';
        $('canvasArea').style.justifyContent = 'center';
        $('canvasArea').style.alignItems = 'center';
        shell.style.flexShrink = '1';
        shell.style.maxWidth = '100%';
        shell.style.maxHeight = '100%';
        const pad = isCompact() ? (window.innerWidth < 681 ? 16 : 36) : 75;
        const s = Math.max(.01, Math.min((rect.width - pad) / engine.width, (rect.height - (isCompact() ? 14 : 72)) / engine.height));
        shell.style.width = Math.max(50, engine.width * s) + 'px';
        shell.style.height = Math.max(50, engine.height * s) + 'px';
        $('zoomLabel').textContent = 'FIT VIEW';
    }
    $('fitBtn').classList.toggle('active', state.zoom === 'fit');
    $('actualBtn').classList.toggle('active', state.zoom === 'actual');
    updateCanvasOverlay();
}
function drawImageLayer(ctx, layer, W, H) {
    if (!layer?.visible)
        return;
    const img = layer.img;
    const iw = img.naturalWidth || img.width,
        ih = img.naturalHeight || img.height;
    const contain = Math.min(W / iw, H / ih);
    const drawW = iw * contain * layer.scale,
        drawH = ih * contain * layer.scale;
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, layer.opacity / 100));
    ctx.globalCompositeOperation = layer.blend || 'source-over';
    ctx.translate(W / 2 + (layer.x / 100) * W / 2, H / 2 + (layer.y / 100) * H / 2);
    ctx.rotate((layer.rotation || 0) * Math.PI / 180);
    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();
}
function getStageMetrics() {
    if (!engine?.width || !engine?.height)
        return null;
    const shell = $("artShell");
    const rect = shell.getBoundingClientRect();
    if (!rect.width || !rect.height)
        return null;
    return {
        W: engine.width,
        H: engine.height,
        shell,
        rect
    };
}
function getLayerGeometry(layer, W, H) {
    const img = layer?.img;
    if (!img)
        return null;
    const iw = img.naturalWidth || img.width,
        ih = img.naturalHeight || img.height;
    const contain = Math.min(W / iw, H / ih);
    const width = iw * contain * layer.scale,
        height = ih * contain * layer.scale;
    const cx = W / 2 + (layer.x / 100) * W / 2,
        cy = H / 2 + (layer.y / 100) * H / 2;
    return {
        cx,
        cy,
        width,
        height,
        rotation: (layer.rotation || 0) * Math.PI / 180
    };
}
function renderSnapGuides() {
    const gx = $("guideX"),
        gy = $("guideY");
    if (gx) {
        gx.hidden = snapGuides.x == null;
        if (snapGuides.x != null)
            gx.style.left = snapGuides.x + '%';
    }
    if (gy) {
        gy.hidden = snapGuides.y == null;
        if (snapGuides.y != null)
            gy.style.top = snapGuides.y + '%';
    }
}
function clearSnapGuides() {
    snapGuides.x = null;
    snapGuides.y = null;
    renderSnapGuides();
}
function updateCanvasOverlay() {
    const overlay = $("canvasOverlay"),
        frame = $("layerFrame");
    if (!overlay || !frame) {
        return;
    }
    const layer = state.imageLayers.find(x => x.key === state.selectedImageLayer && x.visible);
    const metrics = getStageMetrics();
    if (!layer || !metrics) {
        frame.hidden = true;
        overlay.style.pointerEvents = 'auto';
        $('artShell')?.classList.remove('is-layer-draggable', 'is-layer-dragging', 'is-rotating');
        clearSnapGuides();
        return;
    }
    const g = getLayerGeometry(layer, metrics.W, metrics.H);
    if (!g) {
        frame.hidden = true;
        clearSnapGuides();
        return;
    }
    frame.hidden = false;
    frame.classList.toggle('is-active', !!layer);
    frame.style.left = (g.cx / metrics.W * 100) + '%';
    frame.style.top = (g.cy / metrics.H * 100) + '%';
    frame.style.width = (g.width / metrics.W * 100) + '%';
    frame.style.height = (g.height / metrics.H * 100) + '%';
    frame.style.transform = `translate(-50%,-50%) rotate(${layer.rotation || 0}deg)`;
    $("layerFrameLabel").textContent = (layer.name || 'LAYER').toUpperCase().slice(0, 24);
    $('artShell')?.classList.add('is-layer-draggable');
    if (activeCanvasGesture?.layerKey !== layer.key) {
        $('artShell')?.classList.remove('is-layer-dragging', 'is-rotating');
    }
    renderSnapGuides();
}
function getStagePointFromEvent(ev) {
    const metrics = getStageMetrics();
    if (!metrics)
        return null;
    const x = (ev.clientX - metrics.rect.left) / metrics.rect.width * metrics.W;
    const y = (ev.clientY - metrics.rect.top) / metrics.rect.height * metrics.H;
    return {
        ...metrics,
        x,
        y
    };
}
function hitTestImageLayer(px, py) {
    const metrics = getStageMetrics();
    if (!metrics)
        return null;
    for (let i = state.imageLayers.length - 1; i >= 0; i--) {
        const layer = state.imageLayers[i];
        if (!layer.visible)
            continue;
        const g = getLayerGeometry(layer, metrics.W, metrics.H);
        if (!g)
            continue;
        const dx = px - g.cx,
            dy = py - g.cy;
        const cos = Math.cos(-g.rotation),
            sin = Math.sin(-g.rotation);
        const lx = dx * cos - dy * sin,
            ly = dx * sin + dy * cos;
        if (Math.abs(lx) <= g.width / 2 && Math.abs(ly) <= g.height / 2)
            return {
                layer,
                geometry: g
            };
    }
    return null;
}
function getLocalPointInGeometry(px, py, g) {
    const dx = px - g.cx,
        dy = py - g.cy;
    const cos = Math.cos(-g.rotation),
        sin = Math.sin(-g.rotation);
    return {
        x: dx * cos - dy * sin,
        y: dx * sin + dy * cos
    };
}
function setLayerCenterFromPixels(layer, cx, cy, W, H) {
    layer.x = ((cx - W / 2) / (W / 2)) * 100;
    layer.y = ((cy - H / 2) / (H / 2)) * 100;
}
function applySnap(layer, metrics) {
    const g = getLayerGeometry(layer, metrics.W, metrics.H);
    if (!g)
        return;
    const threshold = Math.max(10, Math.min(metrics.W, metrics.H) * 0.015);
    let cx = g.cx,
        cy = g.cy;
    let guideX = null,
        guideY = null;
    if (Math.abs(cx - metrics.W / 2) <= threshold) {
        cx = metrics.W / 2;
        guideX = 50;
    } else if (Math.abs(cx - g.width / 2) <= threshold) {
        cx = g.width / 2;
    } else if (Math.abs(cx - (metrics.W - g.width / 2)) <= threshold) {
        cx = metrics.W - g.width / 2;
    }
    if (Math.abs(cy - metrics.H / 2) <= threshold) {
        cy = metrics.H / 2;
        guideY = 50;
    } else if (Math.abs(cy - g.height / 2) <= threshold) {
        cy = g.height / 2;
    } else if (Math.abs(cy - (metrics.H - g.height / 2)) <= threshold) {
        cy = metrics.H - g.height / 2;
    }
    setLayerCenterFromPixels(layer, cx, cy, metrics.W, metrics.H);
    snapGuides.x = guideX;
    snapGuides.y = guideY;
    renderSnapGuides();
}
function beginCanvasHistory() {
    if (!activeCanvasGesture)
        recordHistory();
}
function startCanvasGesture(layer, mode, ev) {
    const pt = getStagePointFromEvent(ev);
    if (!pt)
        return;
    recordHistory();
    const cx = pt.W / 2 + (layer.x / 100) * pt.W / 2,
        cy = pt.H / 2 + (layer.y / 100) * pt.H / 2;
    activeCanvasGesture = {
        pointerId: ev.pointerId,
        layerKey: layer.key,
        mode,
        startX: pt.x,
        startY: pt.y,
        startScale: layer.scale,
        startCx: layer.x,
        startCy: layer.y,
        startRotation: layer.rotation || 0,
        startDistance: Math.hypot(pt.x - cx, pt.y - cy) || 1,
        startPointerAngle: Math.atan2(pt.y - cy, pt.x - cx),
        centerPxX: cx,
        centerPxY: cy
    };
    $('artShell').classList.add('is-layer-dragging');
    $('artShell').classList.toggle('is-rotating', mode === 'rotate');
    $('canvasOverlay').setPointerCapture?.(ev.pointerId);
    clearSnapGuides();
}
function startPinchGesture(layer) {
    const pts = [...activePointers.values()].slice(0, 2);
    if (pts.length < 2)
        return;
    recordHistory();
    const [a, b] = pts;
    const metrics = getStageMetrics();
    if (!metrics)
        return;
    activeCanvasGesture = {
        layerKey: layer.key,
        mode: 'pinch',
        pointerIds: [...activePointers.keys()].slice(0, 2),
        startMidX: (a.x + b.x) / 2,
        startMidY: (a.y + b.y) / 2,
        startDistance: Math.hypot(b.x - a.x, b.y - a.y) || 1,
        startAngle: Math.atan2(b.y - a.y, b.x - a.x),
        startScale: layer.scale,
        startRotation: layer.rotation || 0,
        startCx: layer.x,
        startCy: layer.y
    };
    $('artShell').classList.add('is-layer-dragging', 'is-rotating');
    clearSnapGuides();
}
function updateGestureUI() {
    updateImageLayers();
    updateSettings();
    rebuildComposite(false);
}
function updatePointerFromEvent(ev) {
    const pt = getStagePointFromEvent(ev);
    if (!pt)
        return null;
    activePointers.set(ev.pointerId, {
        x: pt.x,
        y: pt.y,
        pointerType: ev.pointerType
    });
    return pt;
}
function handleCanvasPointerMove(ev) {
    const pt = updatePointerFromEvent(ev);
    if (!activeCanvasGesture || !pt)
        return;
    const layer = state.imageLayers.find(x => x.key === activeCanvasGesture.layerKey);
    if (!layer)
        return;
    if (activeCanvasGesture.mode === 'move' && activeCanvasGesture.pointerId === ev.pointerId) {
        const dx = pt.x - activeCanvasGesture.startX,
            dy = pt.y - activeCanvasGesture.startY;
        layer.x = activeCanvasGesture.startCx + dx / (pt.W / 2) * 100;
        layer.y = activeCanvasGesture.startCy + dy / (pt.H / 2) * 100;
        applySnap(layer, pt);
    } else if (activeCanvasGesture.mode === 'scale' && activeCanvasGesture.pointerId === ev.pointerId) {
        const cx = activeCanvasGesture.centerPxX,
            cy = activeCanvasGesture.centerPxY;
        const dist = Math.hypot(pt.x - cx, pt.y - cy) || 1;
        layer.scale = Math.max(.05, Math.min(8, activeCanvasGesture.startScale * (dist / activeCanvasGesture.startDistance)));
        clearSnapGuides();
    } else if (activeCanvasGesture.mode === 'rotate' && activeCanvasGesture.pointerId === ev.pointerId) {
        const ang = Math.atan2(pt.y - activeCanvasGesture.centerPxY, pt.x - activeCanvasGesture.centerPxX);
        layer.rotation = activeCanvasGesture.startRotation + (ang - activeCanvasGesture.startPointerAngle) * 180 / Math.PI;
        clearSnapGuides();
    } else if (activeCanvasGesture.mode === 'pinch' && activeCanvasGesture.pointerIds?.includes(ev.pointerId) && activePointers.size >= 2) {
        const pointers = [...activePointers.values()].slice(0, 2);
        const [a, b] = pointers;
        const midX = (a.x + b.x) / 2,
            midY = (a.y + b.y) / 2;
        const dist = Math.hypot(b.x - a.x, b.y - a.y) || 1;
        const angle = Math.atan2(b.y - a.y, b.x - a.x);
        layer.scale = Math.max(.05, Math.min(8, activeCanvasGesture.startScale * (dist / activeCanvasGesture.startDistance)));
        layer.rotation = activeCanvasGesture.startRotation + (angle - activeCanvasGesture.startAngle) * 180 / Math.PI;
        layer.x = activeCanvasGesture.startCx + (midX - activeCanvasGesture.startMidX) / (pt.W / 2) * 100;
        layer.y = activeCanvasGesture.startCy + (midY - activeCanvasGesture.startMidY) / (pt.H / 2) * 100;
        applySnap(layer, pt);
    }
    updateGestureUI();
}
function finishCanvasGesture() {
    activeCanvasGesture = null;
    $('artShell').classList.remove('is-layer-dragging', 'is-rotating');
    clearSnapGuides();
    updateCanvasOverlay();
}
function endCanvasGesture(ev) {
    activePointers.delete(ev.pointerId);
    if (!activeCanvasGesture)
        return;
    if (activeCanvasGesture.mode === 'pinch') {
        if (activePointers.size < 2)
            finishCanvasGesture();
        return;
    }
    if (activeCanvasGesture.pointerId === ev.pointerId)
        finishCanvasGesture();
}
function initCanvasManipulation() {
    const overlay = $("canvasOverlay"),
        rotateHandle = $("rotateHandle"),
        resizeHandles = [...document.querySelectorAll(".resize-handle")];
    if (!overlay)
        return;
    const directStart = (mode, ev) => {
        const layer = state.imageLayers.find(x => x.key === state.selectedImageLayer && x.visible);
        if (!layer)
            return;
        ev.preventDefault();
        ev.stopPropagation();
        updatePointerFromEvent(ev);
        overlay.setPointerCapture?.(ev.pointerId);
        startCanvasGesture(layer, mode, ev);
    };
    rotateHandle?.addEventListener("pointerdown", ev => directStart("rotate", ev));
    resizeHandles.forEach(h => h.addEventListener("pointerdown", ev => directStart("scale", ev)));
    overlay.addEventListener('wheel', ev => {
        const layer = state.imageLayers.find(x => x.key === state.selectedImageLayer && x.visible);
        if (!layer)
            return;
        ev.preventDefault();
        recordHistory();
        layer.scale = Math.max(.05, Math.min(8, layer.scale * (ev.deltaY < 0 ? 1.06 : 0.94)));
        updateGestureUI();
    }, {
        passive: false
    });
    overlay.addEventListener('pointerdown', ev => {
        if (state.compare || state.processing)
            return;
        const pt = updatePointerFromEvent(ev);
        if (!pt)
            return;
        overlay.setPointerCapture?.(ev.pointerId);
        const selectedLayer = state.imageLayers.find(x => x.key === state.selectedImageLayer && x.visible);
        if (ev.pointerType === 'touch' && activePointers.size === 2) {
            const layer = selectedLayer || hitTestImageLayer(pt.x, pt.y)?.layer;
            if (layer) {
                if (state.selectedImageLayer !== layer.key)
                    selectImageLayer(layer.key);
                ev.preventDefault();
                startPinchGesture(layer);
                return;
            }
        }
        if (selectedLayer) {
            const sg = getLayerGeometry(selectedLayer, pt.W, pt.H);
            if (sg) {
                const local = getLocalPointInGeometry(pt.x, pt.y, sg);
                const hr = Math.max(16, Math.min(sg.width, sg.height) * 0.05);
                const corners = [[-sg.width / 2, -sg.height / 2], [sg.width / 2, -sg.height / 2], [-sg.width / 2, sg.height / 2], [sg.width / 2, sg.height / 2]];
                const onCorner = corners.some(([cx, cy]) => Math.hypot(local.x - cx, local.y - cy) <= hr * 1.35);
                const rotateOffset = 34;
                const onRotate = Math.hypot(local.x, local.y - (-sg.height / 2 - rotateOffset)) <= hr * 1.45;
                if (onRotate) {
                    ev.preventDefault();
                    startCanvasGesture(selectedLayer, 'rotate', ev);
                    return;
                }
                if (onCorner) {
                    ev.preventDefault();
                    startCanvasGesture(selectedLayer, 'scale', ev);
                    return;
                }
            }
        }
        const hit = hitTestImageLayer(pt.x, pt.y);
        if (!hit)
            return;
        if (state.selectedImageLayer !== hit.layer.key)
            selectImageLayer(hit.layer.key);
        ev.preventDefault();
        startCanvasGesture(hit.layer, 'move', ev);
    });
    overlay.addEventListener('pointermove', handleCanvasPointerMove);
    overlay.addEventListener('pointerup', endCanvasGesture);
    overlay.addEventListener('pointercancel', endCanvasGesture);
    overlay.addEventListener('lostpointercapture', ev => {
        activePointers.delete(ev.pointerId);
        if (activeCanvasGesture && ((activeCanvasGesture.pointerId === ev.pointerId) || (activeCanvasGesture.pointerIds?.includes(ev.pointerId))))
            finishCanvasGesture();
    });
}

const previewComposite = document.createElement('canvas');
const previewSecondary = document.createElement('canvas');
function buildCompositeCanvas(target, maxDim, overlaysOnly=false) {
    const base = getBaseLayer();
    if (!base)
        return null;
    const bw = base.img.naturalWidth || base.img.width,
        bh = base.img.naturalHeight || base.img.height;
    const factor = Math.min(1, maxDim / Math.max(bw, bh));
    const W = Math.max(1, Math.round(bw * factor)),
        H = Math.max(1, Math.round(bh * factor));
    target.width = W;
    target.height = H;
    const ctx = target.getContext('2d');
    ctx.clearRect(0, 0, W, H);
    const list = overlaysOnly ? state.imageLayers.slice(1) : state.imageLayers;
    list.forEach(layer => drawImageLayer(ctx, layer, W, H));
    return target;
}
function updateDocumentMeta() {
    const base = getBaseLayer();
    if (!base)
        return;
    state.filename = base.name || 'CHAMELEON_COMPOSITE.PNG';
    $('imageName').textContent = (state.filename || 'IMAGE').toUpperCase().slice(0, 30);
    const bw = base.img.naturalWidth || base.img.width,
        bh = base.img.naturalHeight || base.img.height;
    $('resolution').textContent = `${bw} × ${bh} PX`;
}
function rebuildComposite(showToast) {
    if (!state.imageLayers.length)
        return;
    try {
        updateDocumentMeta();
        const sourceCanvas = buildCompositeCanvas(previewComposite, previewLimit(), false);
        const secondaryCanvas = state.imageLayers.length > 1 ? buildCompositeCanvas(previewSecondary, previewLimit(), true) : null;
        state.source = sourceCanvas;
        engine.setSource(sourceCanvas, previewLimit(), secondaryCanvas);
        thumbGeneration++;
        fitCanvas();
        scheduleRender();
        renderLibrary();
        if (showToast)
            notify('이미지 레이어가 업데이트되었습니다.');
    } catch (e) {
        console.error(e);
        reportAnalyticsError('composite', e);
        notify('이미지 합성 오류: ' + e.message);
    }
}
function validateFiles(fileList) {
    const files = Array.from(fileList || []).filter(Boolean);
    const valid = [];
    for (const file of files) {
        if ((!file.type.startsWith('image/')) && !/\.(jpg|jpeg|png|webp|gif|avif|heic|heif)$/i.test(file.name)) {
            notify('이미지 파일만 추가할 수 있어요.');
            continue;
        }
        if (file.size > 80 * 1024 * 1024) {
            notify('80MB 이하의 이미지를 선택해주세요.');
            continue;
        }
        valid.push(file);
    }
    return valid;
}
function fileToImage(file) {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            URL.revokeObjectURL(url);
            resolve({
                img,
                name: file.name
            });
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error(file.name + ' 파일을 읽을 수 없습니다.'));
        };
        img.src = url;
    });
}
async function replaceBaseImage(file) {
    const valid = validateFiles([file]);
    if (!valid.length)
        return;
    try {
        const {img, name} = await fileToImage(valid[0]);
        recordHistory();
        if (state.imageLayers.length) {
            const keep = state.imageLayers.slice(1);
            state.imageLayers = [newImageLayer(img, name), ...keep];
        } else
            state.imageLayers = [newImageLayer(img, name)];
        state.sample = false;
        state.selectedImageLayer = state.imageLayers[0].key;
        state.selection = null;
        updateImageLayers();
        rebuildComposite();
        trackAnalytics('image_uploaded', { upload_type: 'base', image_count: state.imageLayers.length });
        notify('기본 이미지가 교체되었습니다.');
    } catch (e) {
        reportAnalyticsError('replace_base_image', e);
        notify(e.message);
    }
}
async function appendImageLayers(files) {
    const valid = validateFiles(files);
    if (!valid.length)
        return;
    try {
        const images = await Promise.all(valid.map(fileToImage));
        recordHistory();
        images.forEach(({img, name}) => state.imageLayers.push(newImageLayer(img, name)));
        state.sample = false;
        state.selectedImageLayer = state.imageLayers.at(-1)?.key ?? null;
        state.selection = null;
        updateImageLayers();
        rebuildComposite();
        trackAnalytics('image_uploaded', { upload_type: 'layer', image_count: state.imageLayers.length });
        notify(images.length === 1 ? '새 이미지 레이어가 추가되었습니다.' : `${images.length}개의 이미지 레이어가 추가되었습니다.`);
    } catch (e) {
        reportAnalyticsError('append_image_layer', e);
        notify(e.message);
    }
}
function downloadBlob(blob, name) {
    const a = document.createElement('a');
    const url = URL.createObjectURL(blob);
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
}
function getExportName(ext) {
    const clean = (state.filename || 'chameleon').replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_가-힣\-]/g, '_').slice(0, 55);
    return (clean || 'chameleon') + '_chameleon.' + ext;
}
function closeExportDialog() {
    $('exportDialog').close();
    if (exportBlobUrl) {
        URL.revokeObjectURL(exportBlobUrl);
        exportBlobUrl = null;
    }
    exportBlob = null;
    $('exportPreview').removeAttribute('src');
}
function openExportDialog(blob, w, h) {
    exportBlob = blob;
    if (exportBlobUrl)
        URL.revokeObjectURL(exportBlobUrl);
    exportBlobUrl = URL.createObjectURL(blob);
    $('exportPreview').src = exportBlobUrl;
    $('exportDimensions').textContent = `PNG · ${w} × ${h} PX · ${(blob.size / 1024 / 1024).toFixed(1)} MB`;
    $('exportDialog').showModal();
}
async function shareResult() {
    if (!exportBlob)
        return;
    const file = new File([exportBlob], getExportName('png'), {
        type: 'image/png'
    });
    try {
        if (navigator.canShare?.({
            files: [file]
        }) && navigator.share) {
            await navigator.share({
                files: [file],
                title: 'CHAMELEON'
            });
            return;
        }
        notify('공유 메뉴를 사용할 수 없습니다. PNG 다운로드를 이용해주세요.');
    } catch (err) {
        if (err.name !== 'AbortError') {
            console.error(err);
            reportAnalyticsError('share_result', err);
            notify('공유를 완료하지 못했습니다. PNG 다운로드를 이용해주세요.');
        }
    }
}
async function exportPNG() {
    if (state.processing || !state.imageLayers.length)
        return;
    state.processing = true;
    const btn = $('exportBtn');
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.textContent = 'RENDERING...';
    try {
        const base = getBaseLayer();
        const native = Math.max(base.img.naturalWidth || base.img.width, base.img.naturalHeight || base.img.height);
        const target = Math.min(native, onTouchDevice() ? 2048 : 4096, engine.maxTexture);
        const exportCanvas = document.createElement('canvas');
        const sourceCanvas = buildCompositeCanvas(exportCanvas, target, false);
        const secondaryCanvas = state.imageLayers.length > 1 ? buildCompositeCanvas(document.createElement('canvas'), target, true) : null;
        engine.setSource(sourceCanvas, target, secondaryCanvas);
        engine.render(state.layers, false);
        const blob = await new Promise((resolve, reject) => engine.canvas.toBlob(b => b ? resolve(b) : reject(new Error('이미지 생성에 실패했습니다.')), 'image/png'));
        if (isCompact() || onTouchDevice())
            openExportDialog(blob, engine.width, engine.height);
        else
            downloadBlob(blob, getExportName('png'));
        trackAnalytics('export_completed', { effect_count: state.layers.length, output_width: engine.width, output_height: engine.height });
        notify(`PNG 준비 완료 · ${engine.width} × ${engine.height}` + (native > target ? ' (기기 메모리 보호를 위해 크기 조절)' : ''));
    } catch (e) {
        console.error(e);
        reportAnalyticsError('export_png', e);
        notify('PNG 내보내기 실패: ' + e.message);
    } finally {
        try {
            rebuildComposite();
        } catch (e) {
            console.error(e);
            reportAnalyticsError('restore_composite_after_export', e);
        }
        state.processing = false;
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
}
function savePreset() {
    const preset = {
        format: 'chameleon-preset',
        version: 2,
        created: new Date().toISOString(),
        layers: state.layers.map(({id, a, b, opacity, blend, enabled, seed}) => ({
            id,
            a,
            b,
            opacity,
            blend,
            enabled,
            seed
        }))
    };
    downloadBlob(new Blob([JSON.stringify(preset, null, 2)], {
        type: 'application/json'
    }), 'chameleon_preset.json');
    notify('CHAMELEON 프리셋 JSON 저장됨');
}
async function loadPreset(file) {
    if (!file)
        return;
    try {
        const str = await file.text();
        const obj = JSON.parse(str);
        if (!['chameleon-preset', 'effect-lab-preset'].includes(obj.format) || !Array.isArray(obj.layers) || obj.layers.length > 30)
            throw new Error('올바른 CHAMELEON 프리셋이 아닙니다.');
        recordHistory();
        state.layers = obj.layers.filter(o => byId.has(o.id)).map(o => {
            const l = newLayer(o.id);
            l.a = Math.min(byId.get(o.id).a.max, Math.max(byId.get(o.id).a.min, Number(o.a) || 0));
            l.b = Math.min(byId.get(o.id).b.max, Math.max(byId.get(o.id).b.min, Number(o.b) || 0));
            l.opacity = Math.min(100, Math.max(0, Number(o.opacity) || 0));
            l.blend = BLENDS.some(b => b[1] === o.blend) ? o.blend : 0;
            l.enabled = Boolean(o.enabled);
            l.seed = Number(o.seed) || l.seed;
            return l;
        });
        state.selection = state.layers.at(-1)?.key ?? null;
        state.selectedImageLayer = null;
        commitStack();
        notify('프리셋을 불러왔습니다.');
    } catch (e) {
        notify('프리셋 오류: ' + e.message);
    }
}
function initEvents() {
    $('undoBtn').onclick = undo;
    $('redoBtn').onclick = redo;
    updateHistoryButtons();
    document.querySelectorAll('.mobile-tab').forEach(btn => btn.addEventListener('click', () => switchPanel(btn.dataset.panel)));
    $('closeExport').onclick = closeExportDialog;
    $('exportDialog').addEventListener('click', e => {
        if (e.target === $('exportDialog'))
            closeExportDialog();
    });
    $('exportDialog').addEventListener('cancel', e => {
        e.preventDefault();
        closeExportDialog();
    });
    $('shareExport').onclick = shareResult;
    $('downloadExport').onclick = () => {
        if (exportBlob)
            downloadBlob(exportBlob, getExportName('png'));
    };
    $('openExport').onclick = () => {
        if (exportBlobUrl)
            window.open(exportBlobUrl, '_blank', 'noopener,noreferrer');
    };
    $('loadBtn').onclick = () => $('uploadInput').click();
    $('layerUploadBtn').onclick = () => $('layerInput').click();
    $('addImageLayerBtn').onclick = () => $('layerInput').click();
    $('uploadInput').onchange = e => {
        replaceBaseImage(e.target.files[0]);
        e.target.value = '';
    };
    $('layerInput').onchange = e => {
        appendImageLayers(e.target.files);
        e.target.value = '';
    };
    initCanvasManipulation();
    $('exportBtn').onclick = exportPNG;
    $('fitBtn').onclick = () => {
        state.zoom = 'fit';
        fitCanvas();
    };
    $('actualBtn').onclick = () => {
        state.zoom = 'actual';
        fitCanvas();
    };
    const compare = $('compareBtn');
    const setCompare = active => {
        state.compare = active;
        compare.setAttribute('aria-pressed', String(active));
        compare.classList.toggle('active', active);
        scheduleRender();
    };
    compare.setAttribute('aria-pressed', 'false');
    compare.addEventListener('pointerdown', e => {
        if (e.pointerType === 'touch')
            return;
        e.preventDefault();
        setCompare(true);
    });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(type => compare.addEventListener(type, e => {
        if (e.pointerType === 'touch')
            return;
        if (state.compare)
            setCompare(false);
    }));
    compare.addEventListener('click', e => {
        if (e.pointerType === 'touch' || e.detail === 0)
            setCompare(!state.compare);
    });
    compare.addEventListener('contextmenu', e => e.preventDefault());
    const onKeyDown = e => {
        const focused = document.activeElement;
        const textEditing = focused?.isContentEditable || ['TEXTAREA'].includes(focused?.tagName) ||
        (focused?.tagName === 'INPUT' && !['range', 'checkbox', 'radio', 'file', 'button'].includes(focused.type));
        if ((e.ctrlKey || e.metaKey) && !e.altKey && !textEditing) {
            const k = e.key.toLowerCase();
            if (k === 'z') {
                e.preventDefault();
                if (e.shiftKey)
                    redo();
                else
                    undo();
                return;
            }
            if (k === 'y') {
                e.preventDefault();
                redo();
                return;
            }
        }
        const input = ['INPUT', 'TEXTAREA', 'SELECT'].includes(focused?.tagName);
        if (e.key === '/' && !input) {
            e.preventDefault();
            $('search').focus();
        }
        if (e.code === 'Space' && !input && !e.repeat && !$('helpDialog').open) {
            e.preventDefault();
            state.compare = true;
            scheduleRender();
        }
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', e => {
        if (e.code === 'Space' && state.compare) {
            state.compare = false;
            scheduleRender();
        }
    });
    window.addEventListener('blur', () => {
        if (state.compare) {
            state.compare = false;
            scheduleRender();
        }
    });
    $('search').addEventListener('input', e => {
        state.query = e.target.value.trim().toLowerCase();
        renderLibrary();
    });
    $('clearBtn').onclick = () => {
        if (!state.layers.length)
            return;
        recordHistory();
        state.layers = [];
        state.selection = null;
        commitStack();
        notify('모든 효과를 지웠습니다.');
    };
    $('addEffectBtn').onclick = () => {
        if (isCompact())
            switchPanel('filters');
        $('search').focus();
    };
    $('resetEffectBtn').onclick = () => {
        const l = state.layers.find(x => x.key === state.selection);
        if (!l)
            return;
        const fx = byId.get(l.id);
        recordHistory();
        l.a = fx.a.def;
        l.b = fx.b.def;
        l.opacity = 100;
        l.blend = 0;
        commitStack();
        notify('파라미터가 초기화되었습니다.');
    };
    $('savePresetBtn').onclick = savePreset;
    $('loadPresetBtn').onclick = () => $('presetInput').click();
    $('presetInput').onchange = e => {
        loadPreset(e.target.files[0]);
        e.target.value = '';
    };
    $('helpBtn').onclick = () => $('helpDialog').showModal();
    $('closeHelp').onclick = () => $('helpDialog').close();
    $('dialogOk').onclick = () => $('helpDialog').close();
    $('helpDialog').addEventListener('click', e => {
        if (e.target === $('helpDialog'))
            $('helpDialog').close();
    });
    const zone = $('dropZone');
    let dragDepth = 0;
    zone.addEventListener('dragenter', e => {
        e.preventDefault();
        dragDepth++;
        zone.classList.add('is-dragging');
    });
    zone.addEventListener('dragover', e => {
        e.preventDefault();
    });
    zone.addEventListener('dragleave', e => {
        e.preventDefault();
        dragDepth--;
        if (dragDepth <= 0) {
            dragDepth = 0;
            zone.classList.remove('is-dragging');
        }
    });
    zone.addEventListener('drop', e => {
        e.preventDefault();
        dragDepth = 0;
        zone.classList.remove('is-dragging');
        const files = Array.from(e.dataTransfer.files || []);
        if (!files.length)
            return;
        if (state.sample && state.imageLayers.length === 1) {
            replaceBaseImage(files[0]);
            if (files.length > 1)
                appendImageLayers(files.slice(1));
        } else
            appendImageLayers(files);
    });
    window.addEventListener('dragover', e => e.preventDefault());
    window.addEventListener('drop', e => e.preventDefault());
    window.addEventListener('resize', debounce(fitCanvas, 100));
    window.addEventListener('orientationchange', () => setTimeout(fitCanvas, 160));
    if (window.ResizeObserver) {
        const ro = new ResizeObserver(debounce(fitCanvas, 80));
        ro.observe($('canvasArea'));
    }
    compactQuery.addEventListener?.('change', () => {
        fitCanvas();
        refreshThumbsVisible();
    });
}
async function initialize() {
    try {
        engine = new EffectEngine($('glCanvas'));
        try {
            const thumbCanvas = document.createElement('canvas');
            thumbEngine = new EffectEngine(thumbCanvas);
        } catch (err) {
            thumbEngine = null;
            console.warn('Thumbnail GPU unavailable', err);
        }
        const sample = await sampleImage();
        state.imageLayers = [newImageLayer(sample, 'CHAMELEON_SAMPLE.JPG')];
        state.source = sample;
        state.filename = 'CHAMELEON_SAMPLE.JPG';
        updateDocumentMeta();
        try {
            const saved = JSON.parse(localStorage.getItem('chameleon_stack') || '[]');
            if (Array.isArray(saved))
                state.layers = saved.filter(x => byId.has(x.id)).slice(0, 30).map(o => ({
                    ...newLayer(o.id),
                    ...o,
                    key: nextKey++
                }));
        } catch (_) {}
        if (!state.layers.length) {
            state.layers = [newLayer(63), newLayer(66), newLayer(51)];
            state.layers[0].opacity = 26;
            state.layers[1].opacity = 28;
            state.layers[2].opacity = 18;
        }
        state.selection = state.layers.at(-1)?.key ?? null;
        initEvents();
        renderCategories();
        updateImageLayers();
        renderLibrary();
        updateStack();
        updateSettings();
        if (isCompact())
            switchPanel('filters');
        rebuildComposite();
        let isFirstVisit = true;
        try {
            isFirstVisit = !localStorage.getItem('chameleon_seen');
        } catch (_) {}
        if (isFirstVisit) {
            setTimeout(() => {
                notify('샘플 이미지가 준비되었습니다. 이미지를 드래그해 이동하고, 코너 핸들로 크기를 조절하며, 상단 핸들 또는 두 손가락으로 회전해보세요.');
                try {
                    localStorage.setItem('chameleon_seen', '1');
                } catch (_) {}
            }, 550);
        }
    } catch (err) {
        console.error(err);
        reportAnalyticsError('initialize_webgl', err);
        $('engineText').textContent = 'ENGINE ERROR';
        $('engineText').style.color = '#ff7777';
        $('artShell').innerHTML = '<div style="padding:40px;max-width:450px;line-height:1.7;color:#ffb5b5">이미지 처리 엔진을 시작할 수 없습니다.<br/>' + escapeHtml(err.message) + '<br/>최신 Chrome, Edge, Safari에서 다시 열어주세요.</div>';
        notify('WebGL 초기화 실패: ' + err.message);
    }
}
document.addEventListener('DOMContentLoaded', initialize);
