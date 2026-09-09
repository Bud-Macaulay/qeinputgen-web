const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    t[n] = c >>> 0;
  }
  return t;
})();

export function crc32(bytes) {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

const u16 = (v) => [v & 0xff, (v >>> 8) & 0xff];
const u32 = (v) => [v & 0xff, (v >>> 8) & 0xff, (v >>> 16) & 0xff, (v >>> 24) & 0xff];

const dosDateTime = (d = new Date()) => ({
  time: u16((d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1)),
  date: u16(((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate()),
});

function concatBytes(arrays) {
  const total = arrays.reduce((n, a) => n + a.length, 0);
  const out = new Uint8Array(total);
  let o = 0;
  for (const a of arrays) {
    out.set(a, o);
    o += a.length;
  }
  return out;
}

// Build a store-only (uncompressed) ZIP container. Uses the UTF-8 flag for
// filenames and requires no dependency. Fine for text inputs/UPFs.
export function buildZip(files) {
  const enc = new TextEncoder();
  const { time, date } = dosDateTime();
  const parts = [];
  const central = [];
  let offset = 0;

  for (const f of files) {
    const name = enc.encode(f.name);
    const data = f.data instanceof Uint8Array ? f.data : enc.encode(String(f.data));
    const crc = crc32(data);
    const header = Uint8Array.from([
      ...u32(0x04034b50),
      ...u16(20),
      ...u16(0x0800),
      ...u16(0),
      ...time,
      ...date,
      ...u32(crc),
      ...u32(data.length),
      ...u32(data.length),
      ...u16(name.length),
      ...u16(0),
    ]);
    parts.push(header, name, data);
    central.push({ name, crc, size: data.length, offset, time, date });
    offset += header.length + name.length + data.length;
  }

  const cdStart = offset;
  const centralParts = [];
  for (const e of central) {
    centralParts.push(
      Uint8Array.from([
        ...u32(0x02014b50),
        ...u16(20),
        ...u16(20),
        ...u16(0x0800),
        ...u16(0),
        ...e.time,
        ...e.date,
        ...u32(e.crc),
        ...u32(e.size),
        ...u32(e.size),
        ...u16(e.name.length),
        ...u16(0),
        ...u16(0),
        ...u16(0),
        ...u16(0),
        ...u32(0),
        ...u32(e.offset),
      ]),
      e.name,
    );
  }
  const centralBytes = centralParts.length ? concatBytes(centralParts) : new Uint8Array(0);
  const eocd = Uint8Array.from([
    ...u32(0x06054b50),
    ...u16(0),
    ...u16(0),
    ...u16(central.length),
    ...u16(central.length),
    ...u32(centralBytes.length),
    ...u32(cdStart),
    ...u16(0),
  ]);

  return new Blob([concatBytes([...parts, centralBytes, eocd])], {
    type: "application/zip",
  });
}