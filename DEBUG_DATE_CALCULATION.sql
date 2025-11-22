-- DEBUG: Função para testar cálculo de datas
-- Execute esta função para ver exatamente o que está acontecendo

CREATE OR REPLACE FUNCTION public.test_date_calculation(
    test_day INT DEFAULT 19,
    test_month INT DEFAULT 11,
    test_year INT DEFAULT 2025
)
RETURNS TABLE (
    step TEXT,
    calculated_date DATE,
    day_of_week INT,
    day_name TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
    test_date DATE;
    dow INT;
BEGIN
    -- Passo 1: Criar data com make_date
    test_date := make_date(test_year, test_month, test_day);
    dow := EXTRACT(DOW FROM test_date);
    
    RETURN QUERY SELECT 
        'Data inicial'::TEXT,
        test_date,
        dow,
        CASE dow
            WHEN 0 THEN 'Domingo'
            WHEN 1 THEN 'Segunda'
            WHEN 2 THEN 'Terça'
            WHEN 3 THEN 'Quarta'
            WHEN 4 THEN 'Quinta'
            WHEN 5 THEN 'Sexta'
            WHEN 6 THEN 'Sábado'
        END;
    
    -- Passo 2: Verificar se é final de semana
    IF dow = 0 OR dow = 6 THEN
        RETURN QUERY SELECT 
            'É final de semana - vai ajustar'::TEXT,
            test_date,
            dow,
            'Sim'::TEXT;
    ELSE
        RETURN QUERY SELECT 
            'NÃO é final de semana - NÃO deve ajustar'::TEXT,
            test_date,
            dow,
            'Não'::TEXT;
    END IF;
    
    -- Passo 3: Aplicar regra postpone
    IF dow = 0 THEN 
        test_date := test_date + 1;
        RETURN QUERY SELECT 
            'Domingo -> Segunda (+1 dia)'::TEXT,
            test_date,
            EXTRACT(DOW FROM test_date)::INT,
            'Ajustado'::TEXT;
    ELSIF dow = 6 THEN 
        test_date := test_date + 2;
        RETURN QUERY SELECT 
            'Sábado -> Segunda (+2 dias)'::TEXT,
            test_date,
            EXTRACT(DOW FROM test_date)::INT,
            'Ajustado'::TEXT;
    ELSE
        RETURN QUERY SELECT 
            'Dia útil - sem ajuste'::TEXT,
            test_date,
            EXTRACT(DOW FROM test_date)::INT,
            'Não ajustado'::TEXT;
    END IF;
    
    RETURN;
END;
$$;

-- Testar com dia 19/11/2025 (quarta-feira)
SELECT * FROM test_date_calculation(19, 11, 2025);

-- Testar com dia 20/11/2025 (quinta-feira)
SELECT * FROM test_date_calculation(20, 11, 2025);

-- Testar com dia 22/11/2025 (sábado)
SELECT * FROM test_date_calculation(22, 11, 2025);

-- Testar com dia 23/11/2025 (domingo)
SELECT * FROM test_date_calculation(23, 11, 2025);
