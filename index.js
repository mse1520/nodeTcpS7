/* 침고자료 */
// npm install nodes7
// https://github.com/plcpeople/nodeS7

const net = require('net');

const socket = net.connect({ port: 102, host: '127.0.0.1' });

socket.on('connect', function () {
  console.log('on connect');

  // 해당 장비와 연결후 통신 연결 검증 단계의 전송 프로토콜이 필요함
  // 연결 검증 전송 프로토콜은 2번에 걸쳐서 진행
  /* connect1 */
  socket.write(Buffer.from([
    0x03, 0x00, 0x00, 0x16, 0x11, 0xe0, 0x00, 0x00, 0x00, 0x02,
    0x00, 0xc0, 0x01, 0x0a, 0xc1, 0x02, 0x01, 0x00, 0xc2, 0x02,
    0x01,
    // 2번째 자리가 rack, 1번째 자리가 slot
    // 21번째 배열 = rack * 32 + slot
    // 아무 숫자나 해도 통신에는 문제가없는듯???
    0x01
  ]));

  setTimeout(() => {
    /* connect2 */
    socket.write(Buffer.from([
      0x03, 0x00, 0x00, 0x19, 0x02, 0xf0, 0x80, 0x32, 0x01, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x08, 0x00, 0x00, 0xf0, 0x00, 0x00,
      0x08, 0x00, 0x08, 0x03, 0xc0,
    ]));
  }, 1000);

  /* read command */
  setTimeout(() => {
    socket.write(Buffer.from([
      /* header */
      0x03, 0x00,
      // 19 + 영역갯수 * 12
      0x00, 0x1f,
      0x02, 0xf0, 0x80, 0x32, 0x01, 0x00, 0x00,
      // seq no 통신할 때마다 증가하는 숫자로 추정
      // 고정 가능한 것으로 추정
      0x00, 0x01,
      // 영역갯수 * 12 + 2
      0x00, 0x0e,
      0x00, 0x00, 0x04,
      // 영역갯수 M, DB 등 ...
      0x01,

      /* request data */
      /* request data부는 데이터 영역의 종류의 갯수만큼 늘어남 */
      0x12, 0x0a, 0x10, 0x02,
      // 읽을 바이트 갯수
      0x00, 0x04,
      // data block number
      // ex) DB1: 1, DB2: 2
      0x00, 0x01,
      // 시작주소 | 데이터 영역(or 연산)
      // 시작주소의 증가량 -> word: 16, byte: 8, bit: 8 
      // 시작주소는 데이터 타입에 따라 증가하는 숫자가 다름
      // 데이터 영역 -> M: 0x83, DB: 0x84
      0x84, 0x00, 0x00, 0x00
    ]));
  }, 2000);

  /* 응답 데이터 */
  // 03 00 
  // 프로토콜 전체의 길이: 29
  // 00 1d 
  // 02 f0 80 32 03 00 00 00 02 00 02 00 08 00 00 04 
  // 데이터 종류의 갯수
  // 01 

  /* 데이터부 */
  // 데이터 부는 데이터 종류에 따라 반복 될수있다.
  // 데이터 구분좌
  // 앞은 ff가 아닐시 에러코드로 추정
  // 데이터 타입에따라 뒤의 값이 변한다
  // 읽을 타입의 번호와 일치하는지 체크, 거의 안변하므로 보류
  // ff 04  
  // 데이터의 길이 1byte당 8bit
  // 데이터의 길이 정보의 위치는 23 ~ 24번재 배열 항상 고정
  // 00 20 
  // // 데이터
  // // 데이터는 최소 2바이트 항상 짝수여야함
  // 00 14 00 1e
});

socket.on('data', function (data) {
  console.log(data);
});

socket.on('close', function () {
  console.log('close');
});

socket.on('error', function (err) {
  console.log('on error: ', err.code);
});