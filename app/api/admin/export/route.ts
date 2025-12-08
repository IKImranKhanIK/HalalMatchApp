/**
 * Admin Export API
 * GET /api/admin/export - Export selections to Excel with beautiful formatting
 * GET /api/admin/export?format=csv - Export to CSV (legacy)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { auth } from '@/lib/auth/auth';
import * as XLSX from 'xlsx';

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

    // App colors: #ef8354 (orange), #2d3142 (dark blue), #4f5d75 (gray)
    const headerStyle = {
      fill: { fgColor: { rgb: 'EF8354' } },
      font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 12 },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: {
        top: { style: 'thin', color: { rgb: '000000' } },
        bottom: { style: 'thin', color: { rgb: '000000' } },
        left: { style: 'thin', color: { rgb: '000000' } },
        right: { style: 'thin', color: { rgb: '000000' } },
      },
    };

    const mutualMatchStyle = {
      fill: { fgColor: { rgb: '10B981' } },
      font: { bold: true, color: { rgb: 'FFFFFF' } },
      alignment: { horizontal: 'center' },
    };

    const emailLinkStyle = {
      fill: { fgColor: { rgb: '4F8EF7' } },
      font: { color: { rgb: 'FFFFFF' }, underline: true },
      alignment: { horizontal: 'center' },
    };

    const dataStyle = {
      alignment: { vertical: 'center' },
      border: {
        top: { style: 'thin', color: { rgb: 'CCCCCC' } },
        bottom: { style: 'thin', color: { rgb: 'CCCCCC' } },
        left: { style: 'thin', color: { rgb: 'CCCCCC' } },
        right: { style: 'thin', color: { rgb: 'CCCCCC' } },
      },
    };

    // Apply styles
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');

    // Header row
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = XLSX.utils.encode_cell({ r: 0, c: C });
      if (!ws[address]) continue;
      ws[address].s = headerStyle;
    }

    // Data rows
    for (let R = range.s.r + 1; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const address = XLSX.utils.encode_cell({ r: R, c: C });
        if (!ws[address]) continue;

        // Mutual Match column (K)
        if (C === 10) {
          if (ws[address].v === 'YES') {
            ws[address].s = mutualMatchStyle;
          } else {
            ws[address].s = dataStyle;
          }
        }
        // Email Both column (L) - make it a clickable link
        else if (C === 11) {
          ws[address].s = emailLinkStyle;
          ws[address].l = { Target: ws[address].v };
        }
        // Regular data
        else {
          ws[address].s = dataStyle;
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

      // Headers
      for (let C = mutualRange.s.c; C <= mutualRange.e.c; ++C) {
        const address = XLSX.utils.encode_cell({ r: 0, c: C });
        if (!wsMutual[address]) continue;
        wsMutual[address].s = {
          ...headerStyle,
          fill: { fgColor: { rgb: '10B981' } }, // Green for matches
        };
      }

      // Data rows
      for (let R = mutualRange.s.r + 1; R <= mutualRange.e.r; ++R) {
        for (let C = mutualRange.s.c; C <= mutualRange.e.c; ++C) {
          const address = XLSX.utils.encode_cell({ r: R, c: C });
          if (!wsMutual[address]) continue;

          // Email Both column
          if (C === 8) {
            wsMutual[address].s = emailLinkStyle;
            wsMutual[address].l = { Target: wsMutual[address].v };
            wsMutual[address].v = 'Click to Email Both';
          } else {
            wsMutual[address].s = dataStyle;
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
