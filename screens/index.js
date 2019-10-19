import React, { useEffect, useState } from 'react';
import {
    View,
    Button,
    Text,
    ScrollView,
    Screen,
    Divider,
    NavigationBar
} from '@shoutem/ui';

import * as ImagePicker from 'expo-image-picker';
import * as Permissions from 'expo-permissions';
import axios from 'axios';
import uuid from "uuid";

import env from '../env';
import firebase from "../utils/firebase";
const ImagePickerOptions = {
    allowsEditing: false
}

export default () => {
    const [response, setResponse] = useState(null);
    const [loading, setLoading] = useState(false);

    const promptPermissions = async () => {
        await Permissions.askAsync(Permissions.CAMERA_ROLL);
        await Permissions.askAsync(Permissions.CAMERA);
    }

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync(ImagePickerOptions);

        handleImage(result);
    }

    const takePhoto = async () => {
        const result = await ImagePicker.launchCameraAsync(ImagePickerOptions);

        handleImage(result);
    }

    const handleImage = async ({ uri, cancelled }) => {
        if (cancelled) return;

        setLoading(true);

        try {
            const ref = firebase
                .storage()
                .ref()
                .child(uuid.v4());

            const { data } = await axios.get(uri, { responseType: 'blob' });

            const snapshot = await ref.put(data);

            return await analyseImage(await snapshot.ref.getDownloadURL());
        } catch (error) {
            setLoading(false);

            alert(error);
        }
    }

    const analyseImage = async imageUri => {
        try {
            const { data } = await axios.post(`https://vision.googleapis.com/v1/images:annotate?key=${env.GOOGLE_CLOUD_VISION_API_KEY}`, {
                requests: [
                    {
                        features: [
                            { type: "TEXT_DETECTION" },
                            { type: "DOCUMENT_TEXT_DETECTION" }
                        ],
                        image: {
                            source: {
                                imageUri
                            }
                        }
                    }
                ]
            });

            const { text } = data.responses[0].fullTextAnnotation;

            setResponse(text);

            return text;
        } catch (error) {
            alert(error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        promptPermissions();
    });

    return (
        <Screen styleName="paper fullscreen">
            <NavigationBar
                styleName="inline"
            />
            <ScrollView>
                <View styleName="horizontal h-center" style={{ paddingBottom: 20 }}>
                    <Button
                        styleName="secondary"
                        onPress={pickImage}
                    >
                        <Text>
                            Pick an image from camera roll
                            </Text>
                    </Button>
                </View>
                <View styleName="horizontal h-center" style={{ paddingBottom: 20 }}>
                    <Button
                        styleName="secondary"
                        onPress={takePhoto}
                    >
                        <Text>
                            Take a photo
                            </Text>
                    </Button>
                </View>
                <Divider styleName="line" />
                {response && (
                    <View styleName="horizontal h-center">
                        <Text>
                            {response}
                        </Text>
                    </View>
                )}
                {loading && (
                    <View styleName="horizontal h-center" style={{ paddingTop: 30 }}>
                        <Text>
                            Analysing the image
                        </Text>
                    </View>
                )}
            </ScrollView>
        </Screen>
    )
}