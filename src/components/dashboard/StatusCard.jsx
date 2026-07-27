useEffect(() => {
    let isMounted = true;

    const runAI = async () => {
      setLoading(true);

      if (!historyData || historyData.length < 3) {
        if(isMounted) setLoading(false);
        return;
      }

      try {
        // 🔥 ELIMINAMOS "await SaviaNeuro.train(historyData);"
        // El Dashboard ya se encarga de entrenar, esto causaba que chocaran entre sí.

        const lastEntry = historyData[0]; 
        const lastMood = lastEntry.mood || 'neutral';
        const lastEnergy = lastEntry.energyLevel || 5;

        // Escenarios
        const currentContext = { energyLevel: 5, mood: 'neutral', habits: [] };
        const idealContext = { energyLevel: 6, mood: 'calm', habits: ['sleep', 'meditation', 'water'] };

        // Retrasamos un poquito la predicción para no chocar con el Dashboard
        setTimeout(async () => {
            if(!isMounted) return;
            const scoreReal = await SaviaNeuro.predict(historyData, currentContext);
            const scoreIdeal = await SaviaNeuro.predict(historyData, idealContext);

            setPrediction(scoreReal);
            const trendDelta = parseFloat(scoreReal) - lastEnergy;
            setFeedbackText(generateDynamicFeedback(scoreReal, lastMood, trendDelta));
            setActionPlan(generateActionPlan());

            const boost = (parseFloat(scoreIdeal) - parseFloat(scoreReal)).toFixed(1);
            setImprovement(boost > 0 ? boost : 0);
            
            setLoading(false);
        }, 1500);

      } catch (error) {
        console.error("Error AI:", error);
        if (isMounted) setLoading(false);
      }
    };

    runAI();
    return () => { isMounted = false; };
  }, [historyData]);