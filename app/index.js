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
    } from "react-native-reanimated";
import { useEffect, useState } from "react";
import { GestureHandlerRootView, 
    GestureDetector, 
    Gesture } from 'react-native-gesture-handler';

const GRAVITY = 1000;
const JUMP_FORCE = -500;

const Index = () => {
    const { width, height } = useWindowDimensions();
    const [ score, setScore ] = useState(0);

    const bg = useImage(require('../assets/sprites/background-day.png'));
    const bird = useImage(require('../assets/sprites/bluebird-midflap.png'));
    const pipeDown = useImage(require('../assets/sprites/pipe-green.png'));
    const pipeTop = useImage(require('../assets/sprites/pipe-green-top.png'));
    const base = useImage(require('../assets/sprites/base.png'));

    const font = useFont(require('../assets/fonts/SpaceMono-Regular.ttf'), 30);

    const x = useSharedValue(width);  

    const birdY = useSharedValue(height / 3);
    const birdPosition = {
        x: width / 4,
    }
    const birdYVelocity = useSharedValue(0);

    useEffect(() => {
        x.value = withRepeat( withSequence( withTiming(-150, {duration: 3000, easing: Easing.linear})
        , withTiming(width, {duration: 0})
    ), -1
    );
    },[]);

    useAnimatedReaction(
        () => x.value,
        (currentValue, previousValue) => {
            const middle = birdPosition.x;
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

    useFrameCallback(({ timeSincePreviousFrame: dt}) => {
        if(!dt){
            return;
        }
        birdY.value = birdY.value + ( birdYVelocity.value * dt ) / 1000;
        birdYVelocity.value = birdYVelocity.value + ( GRAVITY * dt ) / 1000;
    });

    const gesture = Gesture.Tap().onStart(() => {
        birdYVelocity.value = JUMP_FORCE;
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




    const pipeOffset = 0;

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
            y={pipeOffset - 360} 
            x={ x } 
            width={104} 
            height={640} 
        />
        <Image 
            image={pipeDown} 
            y={height - 280 + pipeOffset} 
            x={ x } 
            width={104} 
            height={640} 
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
                x={ birdPosition.x } 
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