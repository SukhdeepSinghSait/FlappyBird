import { useWindowDimensions } from "react-native";
import { Canvas, useImage, Image } from "@shopify/react-native-skia";
import { 
    useSharedValue, 
    withTiming, 
    Easing, 
    withSequence,
    withRepeat } from "react-native-reanimated";
import { useEffect } from "react";
const Index = () => {
    const { width, height } = useWindowDimensions();

    const bg = useImage(require('../assets/sprites/background-day.png'));
    const bird = useImage(require('../assets/sprites/bluebird-midflap.png'));
    const pipeDown = useImage(require('../assets/sprites/pipe-green.png'));
    const pipeTop = useImage(require('../assets/sprites/pipe-green-top.png'));
    const base = useImage(require('../assets/sprites/base.png'));

    const x = useSharedValue(width-50);  
    useEffect(() => {
        x.value = withRepeat( withSequence( withTiming(-150, {duration: 3000, easing: Easing.linear})
        , withTiming(width, {duration: 0})
    ), -1
    );
    },[]);

    const pipeOffset = 0;

  return (
    <Canvas style={{ width, height }}>
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
        
        {/* Bird */}
        <Image 
            image={bird} 
            y={height / 2 - 24} 
            x={ width / 4 } 
            width={64} 
            height={48} 
        />
    </Canvas>
  );
};
export default Index;