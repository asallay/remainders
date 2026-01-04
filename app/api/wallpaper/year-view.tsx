import {
    calculateDaysLeftInYear,
    getCurrentDayOfYear,
    getTotalDaysInCurrentYear,
} from '@/lib/calcs';

interface YearViewProps {
    width: number;
    height: number;
    isMondayFirst: boolean;
}

export function YearView({ width, height, isMondayFirst }: YearViewProps) {
    // Colors Config
    const BG_COLOR = '#1a1a1a'; // Dark background
    const TEXT_COLOR = '#888888'; // Grey for text
    const PAST_COLOR = '#FFFFFF'; // White for passed days
    const ACCENT_COLOR = '#FF6B35'; // Orange for current day
    const FUTURE_COLOR = '#404040'; // Dark grey for future

    // Year Logic
    const date = new Date();
    const currentYear = date.getFullYear();
    const currentDayOfYear = getCurrentDayOfYear();
    const daysLeft = calculateDaysLeftInYear();
    const totalDays = getTotalDaysInCurrentYear();

    // Grid Layout Config
    const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const COLUMNS = 3;
    const ROWS = 4;

    // --- Layout Calculations ---
    // 1. Safe Zones
    const SAFE_AREA_TOP = height * 0.25;
    const SAFE_AREA_BOTTOM = height * 0.15;
    const SAFE_HEIGHT = height - SAFE_AREA_TOP - SAFE_AREA_BOTTOM;

    // 2. Horizontal Spacing
    const paddingX = width * 0.18;
    const availableWidth = width - (paddingX * 2);
    const cellWidth = availableWidth / COLUMNS;

    // 3. Size Config
    const dotSize = Math.min(cellWidth / 7, 20);
    const dotGap = dotSize * 0.7;
    const monthLabelSize = dotSize * 1.6;

    // 4. Vertical Calculation
    const monthBlockHeight = monthLabelSize + dotSize + (6 * dotSize) + (5 * dotGap);
    const rowGap = monthLabelSize * 1.0;

    // Stats Text Config
    const statsFontSize = monthLabelSize;
    const statsMargin = rowGap * 4.0;

    const gridHeight = (ROWS * monthBlockHeight) + ((ROWS - 1) * rowGap);
    const totalContentHeight = gridHeight + statsMargin + statsFontSize;

    // 5. Centering
    const startY = SAFE_AREA_TOP + ((SAFE_HEIGHT - totalContentHeight) / 2);
    const statsY = startY + gridHeight + statsMargin;

    // Helper to get days in month
    const getDaysInMonth = (year: number, monthIndex: number) => {
        return new Date(year, monthIndex + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year: number, monthIndex: number) => {
        if (isMondayFirst) {
            const day = new Date(year, monthIndex, 1).getDay();
            return (day === 0 ? 6 : day - 1);
        }
        return new Date(year, monthIndex, 1).getDay(); // 0 = Sun, etc.
    };

    let globalDayCounter = 0;

    // Build the grid
    const monthCells = MONTHS.map((monthName, monthIndex) => {
        const daysInMonth = getDaysInMonth(currentYear, monthIndex);
        const startDay = getFirstDayOfMonth(currentYear, monthIndex); // 0-6

        const dots = [];

        // We render a 7x6 grid
        for (let i = 0; i < 42; i++) {
            const dayNum = i - startDay + 1;
            let color = 'transparent';

            if (dayNum > 0 && dayNum <= daysInMonth) {
                globalDayCounter++;
                if (globalDayCounter < currentDayOfYear) {
                    color = PAST_COLOR;
                } else if (globalDayCounter === currentDayOfYear) {
                    color = ACCENT_COLOR;
                } else {
                    color = FUTURE_COLOR;
                }
            }

            if (dayNum > 0 && dayNum <= daysInMonth) {
                const row = Math.floor(i / 7);
                const col = i % 7;

                dots.push(
                    <div
                        key={`dot-${monthIndex}-${i}`}
                        style={{
                            position: 'absolute',
                            left: col * (dotSize + dotGap),
                            top: row * (dotSize + dotGap),
                            width: dotSize,
                            height: dotSize,
                            borderRadius: '50%',
                            backgroundColor: color,
                        }}
                    />
                );
            }
        }

        // Position of month cell
        const colIndex = monthIndex % COLUMNS;
        const rowIndex = Math.floor(monthIndex / COLUMNS);

        const x = paddingX + (colIndex * cellWidth);
        const y = startY + (rowIndex * (monthBlockHeight + rowGap));

        return (
            <div
                key={monthName}
                style={{
                    position: 'absolute',
                    left: x + (cellWidth - (7 * (dotSize + dotGap))) / 2, // Center in cell
                    top: y,
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <div style={{
                    color: TEXT_COLOR,
                    fontSize: monthLabelSize,
                    marginBottom: dotSize,
                    fontFamily: 'monospace',
                    display: 'flex'
                }}>
                    {monthName}
                </div>
                <div style={{ position: 'relative', width: 7 * (dotSize + dotGap), height: 6 * (dotSize + dotGap), display: 'flex' }}>
                    {dots}
                </div>
            </div>
        );
    });

    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                backgroundColor: BG_COLOR,
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
            }}
        >
            <div style={{ display: 'flex', position: 'relative', width: '100%', height: '100%' }}>
                {monthCells}
            </div>

            <div
                style={{
                    position: 'absolute',
                    top: statsY,
                    left: 0,
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontSize: statsFontSize,
                    fontFamily: 'monospace',
                }}
            >
                <span style={{ color: ACCENT_COLOR }}>{daysLeft}d left</span>
                <span style={{ color: TEXT_COLOR, margin: '0 8px' }}>·</span>
                <span style={{ color: TEXT_COLOR }}>{Math.round((currentDayOfYear / totalDays) * 100)}%</span>
            </div>
        </div>
    );
}
