/**
 * Admin Export API
 * GET /api/admin/export - Export selections to Excel with beautiful formatting
 * GET /api/admin/export?format=csv - Export to CSV (legacy)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { auth } from '@/lib/auth/auth';
import * as XLSX from 'xlsx-js-style';

interface ParticipantData {
  participant_number: number;
  full_name: string;
  gender: string;
  email: string;
  phone: string;
}

interface SelectionData {
  id: string;
  created_at: string;
  selector: ParticipantData | null;
  selected: ParticipantData | null;
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'excel';

    const supabase = createServerClient();

    // Get all selections with participant details
    const { data: selections, error } = await supabase
      .from('interest_selections')
      .select(`
        id,
        created_at,
        selector:selector_id (
          participant_number,
          full_name,
          gender,
          email,
          phone
        ),
        selected:selected_id (
          participant_number,
          full_name,
          gender,
          email,
          phone
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching selections:', error);
      return NextResponse.json(
        { error: 'Failed to fetch selections' },
        { status: 500 }
      );
    }

    // Calculate mutual matches
    const mutualMatches = new Set<string>();
    const selectionsArray: SelectionData[] = (selections as SelectionData[]) || [];

    for (const selection of selectionsArray) {
      if (!selection.selector || !selection.selected) continue;

      // Find reverse selection
      const reverseExists = selectionsArray.find(
        (s) =>
          s.selector?.participant_number === selection.selected?.participant_number &&
          s.selected?.participant_number === selection.selector?.participant_number
      );

      if (reverseExists) {
        const pairId = [
          selection.selector.participant_number,
          selection.selected.participant_number,
        ]
          .sort()
          .join('-');
        mutualMatches.add(pairId);
      }
    }

    // Prepare data
    const headers = [
      'Selector #',
      'Selector Name',
      'Gender',
      'Email',
      'Phone',
      'Selected #',
      'Selected Name',
      'Gender',
      'Email',
      'Phone',
      'Mutual Match',
      'Email Both',
      'Date',
    ];

    const rows = selectionsArray
      .filter((s) => s.selector && s.selected)
      .map((selection) => {
        const pairId = [
          selection.selector!.participant_number,
          selection.selected!.participant_number,
        ]
          .sort()
          .join('-');
        const isMutual = mutualMatches.has(pairId);

        return [
          selection.selector!.participant_number,
          selection.selector!.full_name,
          selection.selector!.gender,
          selection.selector!.email,
          selection.selector!.phone,
          selection.selected!.participant_number,
          selection.selected!.full_name,
          selection.selected!.gender,
          selection.selected!.email,
          selection.selected!.phone,
          isMutual ? 'YES' : 'No',
          `mailto:${selection.selector!.email},${selection.selected!.email}?subject=Halal Match - You've Matched!`,
          new Date(selection.created_at).toLocaleDateString(),
        ];
      });

    // If CSV requested, return CSV
    if (format === 'csv') {
      const csvContent = [
        headers.join(','),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
      ].join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="halal-match-selections-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    // Create Excel workbook with beautiful formatting
    const wb = XLSX.utils.book_new();

    // Create worksheet data
    const wsData = [headers, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Column widths
    ws['!cols'] = [
      { wch: 10 },  // Selector #
      { wch: 20 },  // Selector Name
      { wch: 8 },   // Gender
      { wch: 25 },  // Email
      { wch: 15 },  // Phone
      { wch: 10 },  // Selected #
      { wch: 20 },  // Selected Name
      { wch: 8 },   // Gender
      { wch: 25 },  // Email
      { wch: 15 },  // Phone
      { wch: 12 },  // Mutual Match
      { wch: 15 },  // Email Both
      { wch: 12 },  // Date
    ];

    // Beautiful color scheme
    const headerStyle = {
      fill: { fgColor: { rgb: 'EF8354' } }, // Vibrant orange
      font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 13, name: 'Calibri' },
      alignment: { horizontal: 'center', vertical: 'center', wrapText: false },
      border: {
        top: { style: 'medium', color: { rgb: '2D3142' } },
        bottom: { style: 'medium', color: { rgb: '2D3142' } },
        left: { style: 'thin', color: { rgb: '2D3142' } },
        right: { style: 'thin', color: { rgb: '2D3142' } },
      },
    };

    const mutualMatchYesStyle = {
      fill: { fgColor: { rgb: '10B981' } }, // Emerald green
      font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 11 },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: {
        top: { style: 'thin', color: { rgb: 'DDDDDD' } },
        bottom: { style: 'thin', color: { rgb: 'DDDDDD' } },
        left: { style: 'thin', color: { rgb: 'DDDDDD' } },
        right: { style: 'thin', color: { rgb: 'DDDDDD' } },
      },
    };

    const mutualMatchNoStyle = {
      fill: { fgColor: { rgb: 'FEE2E2' } }, // Light red
      font: { color: { rgb: 'DC2626' }, sz: 10 },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: {
        top: { style: 'thin', color: { rgb: 'DDDDDD' } },
        bottom: { style: 'thin', color: { rgb: 'DDDDDD' } },
        left: { style: 'thin', color: { rgb: 'DDDDDD' } },
        right: { style: 'thin', color: { rgb: 'DDDDDD' } },
      },
    };

    const emailLinkStyle = {
      fill: { fgColor: { rgb: '3B82F6' } }, // Blue
      font: { color: { rgb: 'FFFFFF' }, underline: true, bold: true, sz: 10 },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: {
        top: { style: 'thin', color: { rgb: 'DDDDDD' } },
        bottom: { style: 'thin', color: { rgb: 'DDDDDD' } },
        left: { style: 'thin', color: { rgb: 'DDDDDD' } },
        right: { style: 'thin', color: { rgb: 'DDDDDD' } },
      },
    };

    // Alternating row colors for zebra striping
    const evenRowStyle = {
      fill: { fgColor: { rgb: 'F9FAFB' } }, // Light gray
      alignment: { vertical: 'center' },
      border: {
        top: { style: 'thin', color: { rgb: 'E5E7EB' } },
        bottom: { style: 'thin', color: { rgb: 'E5E7EB' } },
        left: { style: 'thin', color: { rgb: 'E5E7EB' } },
        right: { style: 'thin', color: { rgb: 'E5E7EB' } },
      },
    };

    const oddRowStyle = {
      fill: { fgColor: { rgb: 'FFFFFF' } }, // White
      alignment: { vertical: 'center' },
      border: {
        top: { style: 'thin', color: { rgb: 'E5E7EB' } },
        bottom: { style: 'thin', color: { rgb: 'E5E7EB' } },
        left: { style: 'thin', color: { rgb: 'E5E7EB' } },
        right: { style: 'thin', color: { rgb: 'E5E7EB' } },
      },
    };

    // Highlight mutual match rows with green tint
    const mutualRowEvenStyle = {
      fill: { fgColor: { rgb: 'D1FAE5' } }, // Light green
      alignment: { vertical: 'center' },
      border: {
        top: { style: 'thin', color: { rgb: '10B981' } },
        bottom: { style: 'thin', color: { rgb: '10B981' } },
        left: { style: 'thin', color: { rgb: 'E5E7EB' } },
        right: { style: 'thin', color: { rgb: 'E5E7EB' } },
      },
    };

    const mutualRowOddStyle = {
      fill: { fgColor: { rgb: 'ECFDF5' } }, // Lighter green
      alignment: { vertical: 'center' },
      border: {
        top: { style: 'thin', color: { rgb: '10B981' } },
        bottom: { style: 'thin', color: { rgb: '10B981' } },
        left: { style: 'thin', color: { rgb: 'E5E7EB' } },
        right: { style: 'thin', color: { rgb: 'E5E7EB' } },
      },
    };

    // Apply styles
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');

    // Header row with vibrant orange
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = XLSX.utils.encode_cell({ r: 0, c: C });
      if (!ws[address]) continue;
      ws[address].s = headerStyle;
    }

    // Data rows with alternating colors and mutual match highlighting
    for (let R = range.s.r + 1; R <= range.e.r; ++R) {
      const rowIndex = R - 1; // 0-indexed for data rows
      const isMutualMatch = rows[rowIndex] && rows[rowIndex][10] === 'YES';
      const isEvenRow = rowIndex % 2 === 0;

      for (let C = range.s.c; C <= range.e.c; ++C) {
        const address = XLSX.utils.encode_cell({ r: R, c: C });
        if (!ws[address]) continue;

        // Mutual Match column (K)
        if (C === 10) {
          if (ws[address].v === 'YES') {
            ws[address].s = mutualMatchYesStyle;
          } else {
            ws[address].s = mutualMatchNoStyle;
          }
        }
        // Email Both column (L) - make it a clickable link
        else if (C === 11) {
          ws[address].s = emailLinkStyle;
          ws[address].l = { Target: ws[address].v };
        }
        // Regular data with zebra striping
        else {
          if (isMutualMatch) {
            // Green tinted rows for mutual matches
            ws[address].s = isEvenRow ? mutualRowEvenStyle : mutualRowOddStyle;
          } else {
            // Normal zebra striping
            ws[address].s = isEvenRow ? evenRowStyle : oddRowStyle;
          }
        }
      }
    }

    // Freeze header row
    ws['!freeze'] = { xSplit: 0, ySplit: 1 };

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Selections');

    // Create mutual matches sheet
    const mutualMatchesData = selectionsArray
      .filter((s) => s.selector && s.selected)
      .filter((selection) => {
        const pairId = [
          selection.selector!.participant_number,
          selection.selected!.participant_number,
        ].sort().join('-');
        return mutualMatches.has(pairId);
      })
      .reduce((acc, selection) => {
        const pairId = [
          selection.selector!.participant_number,
          selection.selected!.participant_number,
        ].sort().join('-');

        if (!acc.find((m) => m.pairId === pairId)) {
          const [num1, num2] = pairId.split('-').map(Number);
          const p1 = selectionsArray.find((s) => s.selector?.participant_number === num1)?.selector;
          const p2 = selectionsArray.find((s) => s.selector?.participant_number === num2)?.selector;

          if (p1 && p2) {
            acc.push({
              pairId,
              person1Number: num1,
              person1Name: p1.full_name,
              person1Email: p1.email,
              person1Phone: p1.phone,
              person2Number: num2,
              person2Name: p2.full_name,
              person2Email: p2.email,
              person2Phone: p2.phone,
              emailBoth: `mailto:${p1.email},${p2.email}?subject=Congratulations - It's a Match!&body=Assalamu Alaikum,%0D%0A%0D%0AYou both have selected each other!%0D%0A%0D%0APlease exchange contact information.`,
            });
          }
        }
        return acc;
      }, [] as any[]);

    if (mutualMatchesData.length > 0) {
      const mutualHeaders = [
        'Person 1 #',
        'Person 1 Name',
        'Email',
        'Phone',
        'Person 2 #',
        'Person 2 Name',
        'Email',
        'Phone',
        'Email Both',
      ];

      const mutualRows = mutualMatchesData.map((m) => [
        m.person1Number,
        m.person1Name,
        m.person1Email,
        m.person1Phone,
        m.person2Number,
        m.person2Name,
        m.person2Email,
        m.person2Phone,
        m.emailBoth,
      ]);

      const wsMutual = XLSX.utils.aoa_to_sheet([mutualHeaders, ...mutualRows]);

      wsMutual['!cols'] = [
        { wch: 10 }, { wch: 20 }, { wch: 25 }, { wch: 15 },
        { wch: 10 }, { wch: 20 }, { wch: 25 }, { wch: 15 },
        { wch: 15 },
      ];

      // Apply styles to mutual matches sheet
      const mutualRange = XLSX.utils.decode_range(wsMutual['!ref'] || 'A1');

      // Vibrant green header for mutual matches sheet
      const mutualHeaderStyle = {
        fill: { fgColor: { rgb: '10B981' } }, // Emerald green
        font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 13, name: 'Calibri' },
        alignment: { horizontal: 'center', vertical: 'center' },
        border: {
          top: { style: 'medium', color: { rgb: '059669' } },
          bottom: { style: 'medium', color: { rgb: '059669' } },
          left: { style: 'thin', color: { rgb: '059669' } },
          right: { style: 'thin', color: { rgb: '059669' } },
        },
      };

      // Special email button style for mutual matches
      const mutualEmailLinkStyle = {
        fill: { fgColor: { rgb: 'EF4444' } }, // Red for love/hearts
        font: { color: { rgb: 'FFFFFF' }, underline: true, bold: true, sz: 11 },
        alignment: { horizontal: 'center', vertical: 'center' },
        border: {
          top: { style: 'thin', color: { rgb: 'DDDDDD' } },
          bottom: { style: 'thin', color: { rgb: 'DDDDDD' } },
          left: { style: 'thin', color: { rgb: 'DDDDDD' } },
          right: { style: 'thin', color: { rgb: 'DDDDDD' } },
        },
      };

      // Headers with emerald green
      for (let C = mutualRange.s.c; C <= mutualRange.e.c; ++C) {
        const address = XLSX.utils.encode_cell({ r: 0, c: C });
        if (!wsMutual[address]) continue;
        wsMutual[address].s = mutualHeaderStyle;
      }

      // Data rows with alternating green tints
      for (let R = mutualRange.s.r + 1; R <= mutualRange.e.r; ++R) {
        const rowIndex = R - 1;
        const isEvenRow = rowIndex % 2 === 0;

        for (let C = mutualRange.s.c; C <= mutualRange.e.c; ++C) {
          const address = XLSX.utils.encode_cell({ r: R, c: C });
          if (!wsMutual[address]) continue;

          // Email Both column - vibrant red button
          if (C === 8) {
            wsMutual[address].s = mutualEmailLinkStyle;
            wsMutual[address].l = { Target: wsMutual[address].v };
            wsMutual[address].v = '📧 Email Both';
          } else {
            // Alternating green tints for all mutual match rows
            wsMutual[address].s = isEvenRow ? mutualRowEvenStyle : mutualRowOddStyle;
          }
        }
      }

      wsMutual['!freeze'] = { xSplit: 0, ySplit: 1 };

      XLSX.utils.book_append_sheet(wb, wsMutual, 'Mutual Matches ❤️');
    }

    // Generate Excel file
    const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx', cellStyles: true });

    // Return Excel file
    return new NextResponse(excelBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="halal-match-selections-${new Date().toISOString().split('T')[0]}.xlsx"`,
      },
    });
  } catch (error) {
    console.error('Export API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
