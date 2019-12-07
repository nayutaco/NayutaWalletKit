package co.nayuta.wallet;

import android.app.Activity;
import android.os.Bundle;
import android.content.Intent;
import android.util.Log;
import android.net.Uri;
import java.nio.charset.StandardCharsets;

import android.nfc.NfcAdapter;
import android.nfc.NdefRecord;
import android.nfc.NdefMessage;
import android.os.Parcelable;

import android.content.SharedPreferences;
import android.content.Context;

import android.preference.PreferenceManager;

import org.appcelerator.titanium.TiApplication;
import org.appcelerator.titanium.TiRootActivity;
import org.appcelerator.titanium.proxy.ActivityProxy;
import org.appcelerator.kroll.KrollDict;

public class IntentActivity extends Activity {

    private static final String TAG = "IntentActivity";

    private void activate(String source){
        Log.i(TAG, "IntentActivity.activate");
        Intent intent = new Intent();
        intent.setClassName(this, "co.nayuta.wallet.NayutaActivity");
        intent.setAction(Intent.ACTION_VIEW);
        intent.putExtra("source", source);
        intent.putExtra("data", "blah");

        SharedPreferences sharedPref =  PreferenceManager.getDefaultSharedPreferences(getApplicationContext());
        SharedPreferences.Editor editor = sharedPref.edit();
        editor.putString("intentData",  source);
        editor.commit();

        try {
            Log.d(TAG, "**** startActivity:" + source);
            startActivity(intent);
        }catch(Exception e){
            Log.d(TAG, "**** e:"+e);
        }
    }

    /**
     * activatePaymentActivity
     * @param source
     * @param invoice
     */
    private void activatePaymentActivity(String source, String invoice) {
        Log.i(TAG, "IntentActivity.activatePaymentActivity");
        Intent intent = new Intent();
        intent.setClassName(this, "co.nayuta.wallet.NayutaActivity");
        intent.setAction(Intent.ACTION_VIEW);
        intent.putExtra("source", source);
        intent.putExtra("invoice", invoice);

        SharedPreferences sharedPref =  PreferenceManager.getDefaultSharedPreferences(getApplicationContext());
        SharedPreferences.Editor editor = sharedPref.edit();
        editor.putString("intentData",  source);
        editor.putString("invoice",  invoice);
        editor.commit();

        try {
            Log.d(TAG, "startPaymentActivity");
            startActivity(intent);
        } catch (Exception e) {
            Log.d(TAG, "**** e:"+e);
        }
    }

    @Override
    public void onCreate(Bundle savedInstanceState){
        Log.i(TAG, "IntentActivity.onCreate");
        super.onCreate(savedInstanceState);

        Intent currentIntent = getIntent();
        Bundle extras = currentIntent.getExtras();
        String source = currentIntent.getDataString();
        if (source != null) {
            Log.i(TAG, "source: " + source);
        }
        // Uri uri = currentIntent.getData();
        String action = currentIntent.getAction();
        boolean isInvoice = false;
        String invoice = "";

        // NFCかどうかActionの判定
        if (NfcAdapter.ACTION_NDEF_DISCOVERED.equals(action)) {
            Log.i(TAG, "NDEF_DISCOVERED");
            Parcelable[] rawMessages = getIntent().getParcelableArrayExtra(NfcAdapter.EXTRA_NDEF_MESSAGES);
            if (rawMessages != null) {
                for (Parcelable parcelable : rawMessages) {
                    NdefMessage ndefMessage = (NdefMessage) parcelable;
                    NdefRecord[] ndefRecords = ndefMessage.getRecords();
                    for (NdefRecord ndefRecord : ndefRecords) {
                        Log.i(TAG, "NDEF toString = " + ndefRecord.toString());
                        byte[] payloadBytes = ndefRecord.getPayload();
                        boolean isUTF8 = (payloadBytes[0] & 0b10000000) == 0;
                        int languageLength = payloadBytes[0] & 0b0011111111;
                        int textLength = payloadBytes.length - 1 - languageLength;
                        String languageCode = new String(payloadBytes, 1, languageLength, StandardCharsets.US_ASCII);
                        Log.i(TAG, "NDEF languageCode = " + languageCode);
                        invoice = new String(payloadBytes, 1 + languageLength, textLength, isUTF8 ? StandardCharsets.UTF_8 : StandardCharsets.UTF_16);
                        Log.i(TAG, "NDEF payloadText = " + invoice);

                        // convert to lowercase
                        // check start with 
                        // "lightning://lnb", "lnb", "lightning:lnb"
                        // "addholdinvoice", "acceptholdinvoice", "settleholdinvoice", "cancelholdinvoice", 
                        if (invoice != null) {
                            Log.i(TAG, "isInvoice is true");
                            isInvoice = true;
                            source = invoice;
                        }
                    }
                }
            }
        }

        TiRootActivity app = (TiRootActivity) TiApplication.getAppRootOrCurrentActivity();
        if( app == null ) {
            if (isInvoice) {
                Log.i(TAG, "IntentActivity.onCreate: app is null and is Invoice is true");
                activatePaymentActivity(source, invoice);
            } else {
                Log.i(TAG, "IntentActivity.onCreate: app is null");
                activate(source);
            }
        } else {
            Log.i(TAG, "IntentActivity.onCreate: app is not null");
            ActivityProxy proxy = app.getActivityProxy();
            if( proxy == null ) {
                Log.i(TAG, "IntentActivity.onCreate: app is not null");
                activate(source);
            } else {
                Log.i(TAG, "IntentActivity.onCreate: proxy is not null");
                KrollDict event = new KrollDict();
                if (isInvoice == false) {
                    Log.i(TAG, "**** normal start: " + source);
                    event.put("data", source);
                    proxy.fireEvent("app:resume", event);
                } else {
                    Log.i(TAG, "**** invoice start: " + source);
                    event.put("data", source);
                    // event.put("invoice", invoice);
                    proxy.fireEvent("newintent", event);
                }
            }
        }
        finish();
    }

    @Override
    protected void onNewIntent(Intent intent){
        super.onNewIntent(intent);
        finish();
    }
}