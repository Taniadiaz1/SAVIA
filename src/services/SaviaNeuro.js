// src/services/SaviaNeuro.js
import * as tf from '@tensorflow/tfjs';

// CONFIGURACIÓN: 6 características (incluyendo Agua)
const CONFIG = {
    historyDays: 7, 
    features: 6, // [0:Energía, 1:Ánimo, 2:Dormir, 3:Ejercicio, 4:Social, 5:Agua]
};

class SaviaNeuro {
    constructor() {
        this.model = null;
        this.isTraining = false;
    }

    // --- 1. ARQUITECTURA  ---
    createModel() {
        if(this.model) return; 

        const inputHistory = tf.input({ shape: [CONFIG.historyDays, CONFIG.features], name: 'history' });
        const lstmLayer = tf.layers.lstm({ units: 32, activation: 'tanh', returnSequences: false }).apply(inputHistory);

        const inputContext = tf.input({ shape: [CONFIG.features], name: 'context' });
        const denseContext = tf.layers.dense({ units: 16, activation: 'relu' }).apply(inputContext);

        const combined = tf.layers.concatenate().apply([lstmLayer, denseContext]);
        const x = tf.layers.dense({ units: 16, activation: 'relu' }).apply(combined);
        
        // Usamos 'sigmoid' en la salida para mantener el resultado entre 0 y 1.
        const output = tf.layers.dense({ units: 1, activation: 'sigmoid' }).apply(x);

        this.model = tf.model({ inputs: [inputHistory, inputContext], outputs: output });
        this.model.compile({ 
            optimizer: tf.train.adam(0.01), 
            loss: 'meanSquaredError' 
        });
        
        console.log("🧠 Modelo Savia-Neuro V3 (Optimizando Velocidad)");
    }

    // --- 2. EL TRADUCTOR ---
    normalizeEntry(entry) {
        if (!entry) return Array(CONFIG.features).fill(0);

        const normEnergy = (entry.energyLevel || 5) / 10;

        let moodScore = 0.5; 
        const m = (entry.mood || '').toLowerCase();
        if (['feliz', 'contento', 'happy', 'excited', 'bien'].includes(m)) moodScore = 1.0;
        else if (['calmado', 'relajado', 'calm', 'tranquilo'].includes(m)) moodScore = 0.8;
        else if (['neutral', 'normal', 'regular'].includes(m)) moodScore = 0.5;
        else if (['cansado', 'tired', 'bored', 'agotado'].includes(m)) moodScore = 0.3;
        else if (['triste', 'sad', 'deprimido', 'anxious', 'enojado', 'mal'].includes(m)) moodScore = 0.1;

        const habits = entry.habits || [];
        const hasSleep = habits.some(h => h.includes('sleep') || h.includes('dormir')) ? 1 : 0;
        const hasExercise = habits.some(h => h.includes('run') || h.includes('gym') || h.includes('exercise')) ? 1 : 0;
        const hasSocial = habits.some(h => h.includes('social') || h.includes('amigos') || h.includes('family')) ? 1 : 0;
        const hasWater = habits.some(h => h.includes('water') || h.includes('agua') || h.includes('drop')) ? 1 : 0;

        return [normEnergy, moodScore, hasSleep, hasExercise, hasSocial, hasWater];
    }

    // --- 3. PREPARAR DATOS ---
    prepareTrainingData(fullHistory) {
        const inputsHistory = [];
        const inputsContext = [];
        const labels = []; 

        if (fullHistory.length < 3) return null; 

        const sorted = [...fullHistory].sort((a, b) => a.dateObj - b.dateObj);

        for (let i = 1; i < sorted.length; i++) {
            let pastSequence = [];
            for (let j = 1; j <= CONFIG.historyDays; j++) {
                if (i - j >= 0) {
                    pastSequence.push(this.normalizeEntry(sorted[i - j]));
                }
            }
            
            const oldestKnown = pastSequence[pastSequence.length - 1] || this.normalizeEntry(sorted[0]);
            while (pastSequence.length < CONFIG.historyDays) {
                pastSequence.push(oldestKnown); 
            }
            pastSequence.reverse(); 

            const currentDay = this.normalizeEntry(sorted[i]);
            const targetEnergy = (sorted[i].energyLevel || 5) / 10;

            inputsHistory.push(pastSequence);
            inputsContext.push(currentDay);
            labels.push(targetEnergy);
        }

        return {
            history: tf.tensor3d(inputsHistory),
            context: tf.tensor2d(inputsContext),
            labels: tf.tensor2d(labels, [labels.length, 1])
        };
    }

    // --- 4. ENTRENAR ---
    async train(entries) {
        if (this.isTraining) return;
        
        if (this.model) {
             this.createModel(); 
        } else {
             this.createModel();
        }

        const tensors = this.prepareTrainingData(entries);
        if (!tensors) return;

        this.isTraining = true;

        await this.model.fit([tensors.history, tensors.context], tensors.labels, {
            epochs: 25, // 🔥 REDUCIDO PARA VELOCIDAD EXTREMA
            batchSize: 8,
            shuffle: true,
            yieldEvery: 'epoch', // 🔥 MAGIA: Da pausas para que el navegador dibuje
            callbacks: {
                onEpochEnd: (epoch, logs) => {
                    if (epoch % 10 === 0) console.log(`⏳ Epoch ${epoch}: Error = ${logs.loss.toFixed(4)}`);
                }
            }
        });
        
        tensors.history.dispose();
        tensors.context.dispose();
        tensors.labels.dispose();
        this.isTraining = false;
    }

    // --- 5. PREDECIR MEJORADO ---
    async predict(historyEntries, simulatedContext) {
        if (!this.model) this.createModel();

        const rawHistory = historyEntries.slice(0, CONFIG.historyDays).reverse();
        const sequence = rawHistory.map(e => this.normalizeEntry(e));

        const oldestKnown = sequence[0] || Array(CONFIG.features).fill(0.5);
        while (sequence.length < CONFIG.historyDays) {
            sequence.unshift(oldestKnown);
        }

        const contextVec = this.normalizeEntry(simulatedContext);
        const hTensor = tf.tensor([sequence]); 
        const cTensor = tf.tensor([contextVec]);

        const pred = this.model.predict([hTensor, cTensor]);
        const val = (await pred.data())[0]; 

        hTensor.dispose(); 
        cTensor.dispose();
        pred.dispose();

        const finalScore = val * 10;
        return finalScore.toFixed(1);
    }
}

export default new SaviaNeuro();