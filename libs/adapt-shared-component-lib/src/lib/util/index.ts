import * as xlsx from 'xlsx';
function clamp_range(range: any) {
  if (range.e.r >= 1 << 20) range.e.r = (1 << 20) - 1;
  if (range.e.c >= 1 << 14) range.e.c = (1 << 14) - 1;
  return range;
}

const crefregex =
  /(^|[^._A-Z0-9])([$]?)([A-Z]{1,2}|[A-W][A-Z]{2}|X[A-E][A-Z]|XF[A-D])([$]?)([1-9]\d{0,5}|10[0-3]\d{4}|104[0-7]\d{3}|1048[0-4]\d{2}|10485[0-6]\d|104857[0-6])(?![_.\(A-Za-z0-9])/g;

/*
	deletes `nrows` rows STARTING WITH `start_row`
	- ws         = worksheet object
	- start_row  = starting row (0-indexed) | default 0
	- nrows      = number of rows to delete | default 1
  from: https://github.com/SheetJS/sheetjs/issues/352#issuecomment-456976898
*/

export function xlsx_delete_row(ws: any, start_row: number, nrows = 1) {
  if (!ws) throw new Error('operation expects a worksheet');
  const dense = Array.isArray(ws);
  if (!start_row) start_row = 0;

  /* extract original range */
  const range = xlsx.utils.decode_range(ws['!ref']);
  let R = 0,
    C = 0;

  const formula_cb = function ($0: any, $1: any, $2: any, $3: any, $4: any, $5: any) {
    let _R = xlsx.utils.decode_row($5),
      _C = xlsx.utils.decode_col($3);
    if (_R >= start_row) {
      _R -= nrows;
      if (_R < start_row) return '#REF!';
    }
    return $1 + ($2 == '$' ? $2 + $3 : xlsx.utils.encode_col(_C)) + ($4 == '$' ? $4 + $5 : xlsx.utils.encode_row(_R));
  };

  let addr, naddr;
  /* move cells and update formulae */
  if (dense) {
    for (R = start_row + nrows; R <= range.e.r; ++R) {
      if (ws[R])
        ws[R].forEach(function (cell: any) {
          cell.f = cell.f.replace(crefregex, formula_cb);
        });
      ws[R - nrows] = ws[R];
    }
    ws.length -= nrows;
    for (R = 0; R < start_row; ++R) {
      if (ws[R])
        ws[R].forEach(function (cell: any) {
          cell.f = cell.f.replace(crefregex, formula_cb);
        });
    }
  } else {
    for (R = start_row + nrows; R <= range.e.r; ++R) {
      for (C = range.s.c; C <= range.e.c; ++C) {
        addr = xlsx.utils.encode_cell({ r: R, c: C });
        naddr = xlsx.utils.encode_cell({ r: R - nrows, c: C });
        if (!ws[addr]) {
          delete ws[naddr];
          continue;
        }
        if (ws[addr].f) ws[addr].f = ws[addr].f.replace(crefregex, formula_cb);
        ws[naddr] = ws[addr];
      }
    }
    for (R = range.e.r; R > range.e.r - nrows; --R) {
      for (C = range.s.c; C <= range.e.c; ++C) {
        addr = xlsx.utils.encode_cell({ r: R, c: C });
        delete ws[addr];
      }
    }
    for (R = 0; R < start_row; ++R) {
      for (C = range.s.c; C <= range.e.c; ++C) {
        addr = xlsx.utils.encode_cell({ r: R, c: C });
        if (ws[addr] && ws[addr].f) ws[addr].f = ws[addr].f.replace(crefregex, formula_cb);
      }
    }
  }

  /* write new range */
  range.e.r -= nrows;
  if (range.e.r < range.s.r) range.e.r = range.s.r;
  ws['!ref'] = xlsx.utils.encode_range(clamp_range(range));

  /* merge cells */
  if (ws['!merges'])
    ws['!merges'].forEach(function (merge: any, idx: any) {
      let mergerange;
      switch (typeof merge) {
        case 'string':
          mergerange = xlsx.utils.decode_range(merge);
          break;
        case 'object':
          mergerange = merge;
          break;
        default:
          throw new Error('Unexpected merge ref ' + merge);
      }
      if (mergerange.s.r >= start_row) {
        mergerange.s.r = Math.max(mergerange.s.r - nrows, start_row);
        if (mergerange.e.r < start_row + nrows) {
          delete ws['!merges'][idx];
          return;
        }
      } else if (mergerange.e.r >= start_row) mergerange.e.r = Math.max(mergerange.e.r - nrows, start_row);
      clamp_range(mergerange);
      ws['!merges'][idx] = mergerange;
    });
  if (ws['!merges'])
    ws['!merges'] = ws['!merges'].filter(function (x: any) {
      return !!x;
    });

  /* rows */
  if (ws['!rows']) ws['!rows'].splice(start_row, nrows);
}
