interface LifeViewProps {
    width: number;
    height: number;
    birthDate: string;
}

export function LifeView({ width, height, birthDate }: LifeViewProps) {
    // Colors Config
    const BG_COLOR = '#1a1a1a';
    const TEXT_COLOR = '#888888';
    const PAST_COLOR = '#FFFFFF';
    const CURRENT_COLOR = '#FF6B35';
    const FUTURE_COLOR = '#333333'; // Dark grey

    // Life Logic
    const LIFE_EXPECTANCY_YEARS = 80;
    const birth = new Date(birthDate);
    const today = new Date();

    // Calculate total weeks
    // 80 years * 52 weeks/year = 4160 weeks
    // Each dot represents one week of life
    const TOTAL_DOTS = 4160;

    const diffTime = Math.abs(today.getTime() - birth.getTime());
    const weeksLived = Math.min(Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7)), TOTAL_DOTS);

    const lifePercentage = ((weeksLived / TOTAL_DOTS) * 100).toFixed(1);

    // Layout Calculations
    // We want a big rectangular block of dots.
    const SAFE_AREA_TOP = height * 0.25; // Reserve top 25% for device UI
    const SAFE_AREA_BOTTOM = height * 0.14;
    const SAFE_WIDTH_PADDING = width * 0.10; // 10% padding on sides

    const availableWidth = width - (SAFE_WIDTH_PADDING * 2);
    const availableHeight = height - SAFE_AREA_TOP - SAFE_AREA_BOTTOM;

    // Algorithm to find optimal grid dimensions (Cols x Rows)
    // We want to fit TOTAL_DOTS into (availableWidth x availableHeight).
    // Aspect Ratio of container
    const outputRatio = availableWidth / availableHeight;

    // Ideally, (cols * unit) / (rows * unit) approx outputRatio
    // cols / rows approx outputRatio
    // rows = cols / outputRatio
    // cols * (cols / outputRatio) = TOTAL_DOTS
    // cols^2 = TOTAL_DOTS * outputRatio
    // cols = sqrt(TOTAL_DOTS * outputRatio)

    const estimatedCols = Math.sqrt(TOTAL_DOTS * outputRatio);
    const cols = Math.floor(estimatedCols);
    const rows = Math.ceil(TOTAL_DOTS / cols);

    // Now calculate dot size
    // width = cols * dotSize + (cols-1) * gap
    // Let gap = dotSize * 0.4 (small gap)
    // width = cols * s + (cols-1)*0.4*s = s * (cols + 0.4cols - 0.4) = s * (1.4cols - 0.4)
    // s = width / (1.4cols - 0.4)

    const gapRatio = 0.4;
    const dotSize = Math.floor(availableWidth / (cols + (cols - 1) * gapRatio));
    const gap = Math.max(1, Math.floor(dotSize * gapRatio)); // At least 1px gap

    // Recalculate actual dimensions
    const gridWidth = (cols * dotSize) + ((cols - 1) * gap);
    const gridHeight = (rows * dotSize) + ((rows - 1) * gap);

    // Center the grid
    const startX = (width - gridWidth) / 2;
    const startY = SAFE_AREA_TOP + (availableHeight - gridHeight) / 2;

    // Generate SVG circles for optimized rendering
    const pastCircles = [];
    const futureCircles = [];
    let currentDotPosition = { x: 0, y: 0 };

    for (let i = 0; i < TOTAL_DOTS; i++) {
        const row = Math.floor(i / cols);
        const col = i % cols;
        const cx = col * (dotSize + gap) + dotSize / 2;
        const cy = row * (dotSize + gap) + dotSize / 2;
        const radius = dotSize / 2;

        if (i < weeksLived) {
            pastCircles.push(<circle key={`past-${i}`} cx={cx} cy={cy} r={radius} fill={PAST_COLOR} />);
        } else if (i === weeksLived) {
            currentDotPosition = { cx, cy, radius };
        } else {
            futureCircles.push(<circle key={`future-${i}`} cx={cx} cy={cy} r={radius} fill={FUTURE_COLOR} />);
        }
    }

    // Footer Stats
    const statsY = startY + gridHeight + (height * 0.03);
    const footerFontSize = width * 0.035;

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
            {/* Container for the Grid - Using SVG for optimal performance */}
            <svg
                width={gridWidth}
                height={gridHeight}
                style={{
                    position: 'absolute',
                    left: startX,
                    top: startY,
                }}
            >
                {/* Past dots */}
                {pastCircles}

                {/* Current dot */}
                <circle 
                    cx={currentDotPosition.cx} 
                    cy={currentDotPosition.cy} 
                    r={currentDotPosition.radius} 
                    fill={CURRENT_COLOR} 
                />

                {/* Future dots */}
                {futureCircles}
            </svg>

            {/* Footer */}
            <div
                style={{
                    position: 'absolute',
                    top: statsY,
                    left: 0,
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontSize: footerFontSize,
                    fontFamily: 'monospace',
                    color: TEXT_COLOR,
                }}
            >
                {lifePercentage}% to {LIFE_EXPECTANCY_YEARS}
            </div>
        </div>
    );
}
