import React, { useState, useEffect } from 'react';
import { StatusBar } from 'react-native';
import { AppLoading } from 'expo';
import * as Font from 'expo-font';
import fonts from './config/fonts';

import HomeScreen from './screens';

export default () => {
    const [ready, setReady] = useState(false);

    const loadFonts = async () => await Font.loadAsync(fonts);

    useEffect(() => {
        loadFonts().then(() => setReady(true));
    });

    return !ready ? <AppLoading /> : (
        <>
            <StatusBar barStyle="default" hidden={false} />
            <HomeScreen />
        </> 
    )
}