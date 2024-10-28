import { useWindowDimensions } from "react-native";
import { 
    Canvas, 
    useImage, 
    Image, 
    Group,
    Text,
    useFont,
    } from "@shopify/react-native-skia";
import { 
    useSharedValue, 
    withTiming, 
    Easing, 
    withSequence,
    withRepeat, 
    useFrameCallback,
    useDerivedValue,
    interpolate,
    Extrapolation,
    useAnimatedReaction,
    runOnJS,
    cancelAnimation,
    } from "react-native-reanimated";
import { useEffect, useState } from "react";
import { GestureHandlerRootView, 
    GestureDetector, 
    Gesture } from 'react-native-gesture-handler';

const GRAVITY = 1000;
const JUMP_FORCE = -500;

const pipeWidth = 104;
const pipeHeight = 640;

const Index = () => {
    const { width, height } = useWindowDimensions();
    const [ score, setScore ] = useState(0);

    const bg = useImage(require('../assets/sprites/background-day.png'));
    const bird = useImage(require('../assets/sprites/bluebird-midflap.png'));
    const pipeDown = useImage(require('../assets/sprites/pipe-green.png'));
    const pipeTop = useImage(require('../assets/sprites/pipe-green-top.png'));
    const base = useImage(require('../assets/sprites/base.png'));

    const font = useFont(require('../assets/fonts/SpaceMono-Regular.ttf'), 30);

    const gameOver = useSharedValue(false);
    const pipeX = useSharedValue(width);  

    const birdY = useSharedValue(height / 3);
    const birdX = width / 4;

    const birdYVelocity = useSharedValue(0);

    const pipeOffset = useSharedValue(0);

    const topPipeY = useDerivedValue(() => pipeOffset.value - 360);
    const bottomPipeY = useDerivedValue(() => height - 280 + pipeOffset.value);

    const obstacles = useDerivedValue(() => [
        //bottom pipe
        {
            x: pipeX.value,
            y: bottomPipeY.value,
            w: pipeWidth,
            h: pipeHeight,
        },
        //top pipe
        {
            x: pipeX.value,
            y: topPipeY.value,
            w: pipeWidth,
            h: pipeHeight,
        },

    ]);
    

    useEffect(() => {
        moveTheMap();
    },[]);

    const moveTheMap = () => {
        pipeX.value = withRepeat( withSequence( withTiming(-150, {duration: 3000, easing: Easing.linear})
        , withTiming(width, {duration: 0})
    ), -1
    );
    }

    {/* Scoring System */}
    useAnimatedReaction(
        () => pipeX.value,
        (currentValue, previousValue) => {
            const middle = birdX;
            // change offset for the position of the next gap
            if(previousValue && currentValue < -100 && previousValue >= -100) {
                pipeOffset.value = Math.random() * 200 - 100;
            }
          if (
            currentValue !== previousValue &&
            previousValue &&
            currentValue < middle &&
            previousValue >= middle
          ) {
            // do something ✨
            runOnJS(setScore)(score + 1);
          }
        }
      );
    
      const isPointCollidingWithRect = (point, rect)=> {
        "worklet";
        return(
            point.x >= rect.x && // right of the left edge AND
            point.x <= rect.x + rect.w && // left of the right edge AND 
            point.y >= rect.y && // below the top edge
            point.y <= rect.y + rect.h // above the bottom edge
        );
      };

    {/* Collision Detection */}
    useAnimatedReaction(
        () => birdY.value,
        (currentValue, previousValue) => {
            const center = { 
                x: birdX + 32, 
                y: birdY.value + 24 
            };
            // ground collision detection
            if (currentValue > height - 100 || currentValue < 0) {
                gameOver.value = true;
            };
            const isColiding = obstacles.value.some((rect) => 
                 isPointCollidingWithRect(center, rect)
            );

            if(isColiding) {
                gameOver.value = true;
            };
        }
    );

    useAnimatedReaction(
        () => gameOver.value,
        (currentValue, previousValue) => {
            if (currentValue && !previousValue) {
                cancelAnimation(pipeX);
            }
        }
    );

    useFrameCallback(({ timeSincePreviousFrame: dt}) => {
        if(!dt || gameOver.value) {
            return;
        }
        birdY.value = birdY.value + ( birdYVelocity.value * dt ) / 1000;
        birdYVelocity.value = birdYVelocity.value + ( GRAVITY * dt ) / 1000;
    });

    const restartGame = () => {
        "worklet";
        birdY.value = height / 3;
        birdYVelocity.value = 0;
        gameOver.value = false;
        pipeX.value = width;
        runOnJS(moveTheMap)();
        runOnJS(setScore)(0);
    }

    const gesture = Gesture.Tap().onStart(() => {
        if(gameOver.value) {
            //restart game
            restartGame();
        }
        else{
            //jump
            birdYVelocity.value = JUMP_FORCE;
        }
        
    });

    const birdTransform = useDerivedValue(() => {
        return [
            {
            rotate: interpolate(
                birdYVelocity.value, 
                [-500, 500], 
                [-0.5, 0.5], 
                Extrapolation.CLAMP
                ),
            },
        ];
    });

    const birdOrigin = useDerivedValue(() => {
        return { x: width/4+32, y: birdY.value + 24};
    });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <GestureDetector gesture={gesture}>
    <Canvas 
        style={{ width, height }}>
        {/* Background */}
        <Image 
            image={bg} 
            width={width} 
            height={height} 
            fit={'cover'} 
        />

        {/* Pipe */}
        <Image 
            image={pipeTop} 
            y={topPipeY} 
            x={ pipeX } 
            width={pipeWidth} 
            height={pipeHeight} 
        />
        <Image 
            image={pipeDown} 
            y={bottomPipeY} 
            x={ pipeX } 
            width={pipeWidth} 
            height={pipeHeight} 
        />

        {/* Base */}
        <Image 
            image={base} 
            y={height - 75} 
            width={width} 
            height={150} 
            x={0} 
            fit={"cover"} 
        />
        
        <Group
            transform={birdTransform}
            origin={birdOrigin}>
            {/* Bird */}
            <Image 
                image={bird} 
                y={birdY} 
                x={ birdX } 
                width={64} 
                height={48} 
            />
        </Group>
        


        {/* Score */}
        {font && ( // Ensure the font is loaded before rendering the text
            <Text 
                x={width / 2}
                y={100}
                text={score.toString()}
                font={font}
            />
        )}
    </Canvas>
    </GestureDetector>
    </GestureHandlerRootView>
  );
};
export default Index;